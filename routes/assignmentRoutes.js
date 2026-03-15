const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
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
// @access  Private (instructor only)
router.post("/", instructorOnly, asyncHandler(createAssignment));

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Private
router.get("/", asyncHandler(getAssignments));

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get("/:id", asyncHandler(getAssignment));

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (instructor only)
router.put("/:id", instructorOnly, asyncHandler(updateAssignment));

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (instructor only)
router.delete("/:id", instructorOnly, asyncHandler(deleteAssignment));

module.exports = router;
