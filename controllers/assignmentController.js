const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const User = require("../models/User");
const { sendAssignmentEmail } = require("../utils/emailService");

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId, points, group } = req.body;

    // If a courseId is provided, check if the user is the instructor
    if (courseId) {
      const courseItem = await Course.findById(courseId);
      if (!courseItem) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      if (courseItem.instructorId.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only the course instructor can create course assignments",
        });
      }
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      courseId: courseId || undefined,
      userId: courseId ? undefined : req.user.id,
      points: points || 100,
      group: group || "All",
      status: "open",
      attachmentUrl: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null
    });

    // Send email to students if it's a course assignment
    if (courseId) {
      const students = await User.find({ 
        role: "student",
        "notifications.email": { $ne: false } // Match true or undefined/missing
      }).select("email");
      if (students.length > 0) {
        sendAssignmentEmail(students, assignment);
      }
    }

    res.status(201).json({
      success: true,
      data: assignment,
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
    const { courseId } = req.query;
    let query = {};

    if (courseId) {
      query.courseId = courseId;
    } else {
      // If no courseId is queried, return personal assignments AND courses the user is in.
      // Wait, Course model has no "members". So if a student fetches assignments, maybe they fetch all courses?
      if (req.user.role === "student") {
        // Students can see personal, or all course assignments? Or enrolled ones?
        // Since there is no enroll logic on Course directly, maybe we just return all course assignments for now
        // or whatever belongs to courses.
        query = {
          $or: [
            { userId: req.user.id },
            { courseId: { $exists: true } }
          ]
        };
      } else if (req.user.role === "instructor") {
        const instructorCourses = await Course.find({ instructorId: req.user.id });
        const courseIds = instructorCourses.map((c) => c._id);
        query = {
          $or: [
            { userId: req.user.id },
            { courseId: { $in: courseIds } }
          ]
        };
      } else {
        query.userId = req.user.id;
      }
    }

    const assignments = await Assignment.find(query)
      .populate("courseId", "name code")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments.map((a) => a),
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
      "courseId",
      "name code instructorId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is a member of the course or the instructor, OR if it's their personal assignment
    if (assignment.userId && assignment.userId.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to view this personal assignment",
          });
    }

    if (assignment.courseId) {
        const courseItem = assignment.courseId;
        const isInstructor = courseItem.instructorId.toString() === req.user.id;     

        if (!isInstructor && req.user.role !== "student" && req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to view this course assignment",
        });
        }
    }

    res.status(200).json({
      success: true,
      data: assignment,
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
// @access  Private
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id).populate(
      "courseId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.userId && assignment.userId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: "Not authorized to update this personal assignment" });
    }

    if (assignment.courseId && assignment.courseId.instructorId.toString() !== req.user.id && req.user.role !== "admin") {
      // Allow students to only update their status for class assignments
      if (Object.keys(req.body).length !== 1 || !req.body.status) {
        return res.status(403).json({
          success: false,
          message: "Only the course instructor can update assignment details",
        });
      }
    }

    // Only update fields that are provided
    const updateData = {};
    const allowedFields = ['title', 'description', 'dueDate', 'points', 'group', 'status'];
    if (req.file) {
      updateData.attachmentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: assignment,
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
// @access  Private
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(       
      "courseId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.userId && assignment.userId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: "Not authorized to delete this personal assignment" });
    }

    if (assignment.courseId && assignment.courseId.instructorId.toString() !== req.user.id && req.user.role !== "admin") {
      // Allow students to only update their status for class assignments
      if (Object.keys(req.body).length !== 1 || !req.body.status) {
        return res.status(403).json({
          success: false,
          message: "Only the course instructor can update assignment details",
        });
      }
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
