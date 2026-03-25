const Chat = require("../models/Chat");
const Class = require("../models/Class");

// @desc    Get chat history for a class
// @route   GET /api/chat/:classId
// @access  Private
exports.getClassChat = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Check if user is member of the class
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (!classItem.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this class",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Chat.find({ classId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email avatar")
      .lean();

    const total = await Chat.countDocuments({ classId });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Chat.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only message owner or instructor can delete
    if (
      message.userId.toString() !== req.user.id &&
      req.user.role !== "instructor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await Chat.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Edit a message
// @route   PATCH /api/chat/message/:messageId
// @access  Private
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    let messageItem = await Chat.findById(messageId);

    if (!messageItem) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only message owner can edit
    if (messageItem.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this message",
      });
    }

    messageItem.message = message;
    messageItem.isEdited = true;
    messageItem.editedAt = new Date();

    await messageItem.save();
    messageItem = await messageItem.populate("userId", "name email avatar");

    res.status(200).json({
      success: true,
      data: messageItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
