const Class = require("../models/Class");
const User = require("../models/User");

// Helper function to generate random class code
const generateClassCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (instructor only)
exports.createClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    let { code } = req.body;

    // Check if user is an instructor
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create classes",
      });
    }

    // Generate code if not provided
    if (!code) {
      code = generateClassCode();
    } else {
      code = code.toUpperCase();
    }

    // Check if class code already exists
    const existingClass = await Class.findOne({ code });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Class code already exists",
      });
    }

    const classData = {
      name,
      code,
      description,
      instructorId: req.user.id,
      members: [req.user.id], // Instructor is automatically a member
    };

    const createdClass = await Class.create(classData);

    // Add class to instructor's classes
    await User.findByIdAndUpdate(req.user.id, {
      $push: { classes: createdClass.id },
    });

    res.status(201).json({
      success: true,
      data: createdClass.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all classes for current user
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res) => {
  try {
    let query;

    // If student, get classes they're enrolled in
    // If instructor, get classes they teach
    if (req.user.role === "student") {
      query = { members: req.user.id };
    } else {
      query = { instructorId: req.user.id };
    }

    const classes = await Class.find(query).populate(
      "instructorId",
      "name email avatar"
    );

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes.map((c) => {
        const classObj = c.toJSON();
        classObj.instructorId = c.instructorId?.id || c.instructorId;
        return classObj;
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate("instructorId", "name email avatar")
      .populate("members", "name email avatar");

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is a member or instructor
    const isMember = classItem.members.some(
      (m) => m.id === req.user.id || m._id.toString() === req.user.id
    );
    const isInstructor = classItem.instructorId.id === req.user.id;

    if (!isMember && !isInstructor && req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this class",
      });
    }

    res.status(200).json({
      success: true,
      data: classItem.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (instructor only)
exports.updateClass = async (req, res) => {
  try {
    let classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the instructor
    if (classItem.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor can update this class",
      });
    }

    const { name, code, description } = req.body;

    classItem = await Class.findByIdAndUpdate(
      req.params.id,
      { name, code: code?.toUpperCase(), description },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: classItem.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (instructor only)
exports.deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the instructor
    if (classItem.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor can delete this class",
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    // Remove class from all members
    await User.updateMany(
      { classes: req.params.id },
      { $pull: { classes: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Join a class
// @route   POST /api/classes/:id/join
// @access  Private
exports.joinClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if already a member
    if (classItem.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this class",
      });
    }

    // Add user to class members
    classItem.members.push(req.user.id);
    await classItem.save();

    // Add class to user's classes
    await User.findByIdAndUpdate(req.user.id, {
      $push: { classes: classItem.id },
    });

    res.status(200).json({
      success: true,
      data: classItem.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Join class by code
// @route   POST /api/classes/join
// @access  Private
exports.joinClassByCode = async (req, res) => {
  try {
    const { code } = req.body;

    const classItem = await Class.findOne({ code: code.toUpperCase() });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found with this code",
      });
    }

    // Check if already a member
    if (classItem.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this class",
      });
    }

    // Add user to class members
    classItem.members.push(req.user.id);
    await classItem.save();

    // Add class to user's classes
    await User.findByIdAndUpdate(req.user.id, {
      $push: { classes: classItem.id },
    });

    res.status(200).json({
      success: true,
      data: classItem.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Leave a class
// @route   POST /api/classes/:id/leave
// @access  Private
exports.leaveClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Instructor cannot leave their own class
    if (classItem.instructorId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Instructor cannot leave their own class",
      });
    }

    // Remove user from class members
    classItem.members = classItem.members.filter(
      (m) => m.toString() !== req.user.id
    );
    await classItem.save();

    // Remove class from user's classes
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { classes: classItem.id },
    });

    res.status(200).json({
      success: true,
      message: "Left class successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all members of a class
// @route   GET /api/classes/:id/members
// @access  Private
exports.getMembers = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id).populate(
      "members",
      "name email avatar role"
    );

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      count: classItem.members.length,
      data: classItem.members.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove a member from class
// @route   DELETE /api/classes/:id/members/:userId
// @access  Private (instructor only)
exports.removeMember = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the instructor
    if (classItem.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor can remove members",
      });
    }

    // Cannot remove instructor
    if (classItem.instructorId.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the instructor from the class",
      });
    }

    // Remove user from class members
    classItem.members = classItem.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await classItem.save();

    // Remove class from user's classes
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { classes: classItem.id },
    });

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
