const Assignment = require("../models/Assignment");
const Class = require("../models/Class");

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (instructor only)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId, points } = req.body;

    // Verify class exists and user is the instructor
    const classItem = await Class.findById(classId);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (classItem.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the class instructor can create assignments",
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      classId,
      points: points || 100,
    });

    res.status(201).json({
      success: true,
      data: assignment.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const { classId } = req.query;
    let query = {};

    // If user is student, get assignments from their classes
    if (req.user.role === "student") {
      const userClasses = await Class.find({ members: req.user.id });
      const classIds = userClasses.map((c) => c._id);
      query.classId = { $in: classIds };
    } else if (classId) {
      // Instructors can filter by classId
      query.classId = classId;
    } else {
      // Get all classes taught by instructor
      const instructorClasses = await Class.find({ instructorId: req.user.id });
      const classIds = instructorClasses.map((c) => c._id);
      query.classId = { $in: classIds };
    }

    const assignments = await Assignment.find(query)
      .populate("classId", "name code")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments.map((a) => a.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(
      "classId",
      "name code instructorId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is a member of the class or the instructor
    const classItem = assignment.classId;
    const isMember = classItem.members?.includes(req.user.id);
    const isInstructor = classItem.instructorId.toString() === req.user.id;

    if (!isMember && !isInstructor && req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this assignment",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (instructor only)
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id).populate(
      "classId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is the class instructor
    if (assignment.classId.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the class instructor can update assignments",
      });
    }

    const { title, description, dueDate, points } = req.body;

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, points },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: assignment.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (instructor only)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(
      "classId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is the class instructor
    if (assignment.classId.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the class instructor can delete assignments",
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
