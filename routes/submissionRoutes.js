const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const {
  submitAssignment,
  getMySubmissions,
  getSubmission,
  getAssignmentSubmissions,
  gradeSubmission,
} = require("../controllers/submissionController");
const { protect, instructorOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private
router.post("/assignments/:id/submit", asyncHandler(submitAssignment));

// @desc    Get user's submissions
// @route   GET /api/submissions/me
// @access  Private
router.get("/me", asyncHandler(getMySubmissions));

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
router.get("/:id", asyncHandler(getSubmission));

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private (instructor only)
router.get(
  "/assignments/:id/submissions",
  instructorOnly,
  asyncHandler(getAssignmentSubmissions)
);

// @desc    Grade submission
// @route   PATCH /api/submissions/:id/grade
// @access  Private (instructor only)
router.patch("/:id/grade", instructorOnly, asyncHandler(gradeSubmission));

module.exports = router;
