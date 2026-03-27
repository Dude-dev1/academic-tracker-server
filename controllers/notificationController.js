const Notification = require("../models/Notification");

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { unread } = req.query;

    let query = { userId: req.user.id };

    if (unread === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications.map((n) => n),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user owns the notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notification",
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
