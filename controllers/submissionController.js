const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Class = require("../models/Class");

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private
exports.submitAssignment = async (req, res) => {
  try {
    const { fileUrl, content } = req.body;

    const assignment = await Assignment.findById(req.params.id).populate(
      "classId"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is a member of the class
    const classItem = await Class.findById(assignment.classId);
    if (!classItem.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this class",
      });
    }

    // Check if already submitted
    let submission = await Submission.findOne({
      assignmentId: req.params.id,
      studentId: req.user.id,
    });

    if (submission) {
      // Update existing submission
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.content = content || submission.content;
      submission.submittedAt = new Date();
    } else {
      // Create new submission
      submission = await Submission.create({
        assignmentId: req.params.id,
        studentId: req.user.id,
        fileUrl: fileUrl || "",
        content: content || "",
      });
    }

    await submission.save();

    res.status(201).json({
      success: true,
      data: submission.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's submissions
// @route   GET /api/submissions/me
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate("assignmentId", "title classId")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions.map((s) => s.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("assignmentId")
      .populate("studentId", "name email");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if user is student or assignment instructor
    const assignment = submission.assignmentId;
    const classItem = await Class.findById(assignment.classId);

    const isStudent = submission.studentId._id.toString() === req.user.id;
    const isInstructor = classItem.instructorId.toString() === req.user.id;

    if (!isStudent && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this submission",
      });
    }

    res.status(200).json({
      success: true,
      data: submission.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (instructor only)
exports.getAssignmentSubmissions = async (req, res) => {
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

    // Check if user is the instructor
    if (assignment.classId.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor can view submissions",
      });
    }

    const submissions = await Submission.find({
      assignmentId: req.params.id,
    }).populate("studentId", "name email avatar");

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions.map((s) => s.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Grade a submission
// @route   PATCH /api/submissions/:id/grade
// @access  Private (instructor only)
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id).populate(
      "assignmentId"
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const assignment = submission.assignmentId;
    const classItem = await Class.findById(assignment.classId);

    // Check if user is the instructor
    if (classItem.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the instructor can grade submissions",
      });
    }

    submission.grade = grade;
    submission.feedback = feedback || "";
    submission.gradedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      data: submission.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
