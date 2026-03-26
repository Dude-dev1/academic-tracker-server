const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { protect, instructorOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private
router.post("/", createAssignment);

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get("/", getAssignments);

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get("/:id", getAssignment);

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private
router.put("/:id", updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private
router.delete("/:id", deleteAssignment);

module.exports = router;
