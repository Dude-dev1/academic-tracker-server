const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  joinClass,
  joinClassByCode,
  leaveClass,
  getMembers,
  removeMember,
} = require("../controllers/classController");
const { protect, instructorOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (instructor only)
router.post("/", instructorOnly, asyncHandler(createClass));

// @route   GET /api/classes
// @desc    Get all classes for current user
// @access  Private
router.get("/", asyncHandler(getClasses));

// @route   POST /api/classes/join
// @desc    Join class by code
// @access  Private
router.post("/join", asyncHandler(joinClassByCode));

// @route   GET /api/classes/:id
// @desc    Get single class
// @access  Private
router.get("/:id", asyncHandler(getClass));

// @route   GET /api/classes/:id/members
// @desc    Get class members
// @access  Private
router.get("/:id/members", asyncHandler(getMembers));

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (instructor only)
router.put("/:id", instructorOnly, asyncHandler(updateClass));

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (instructor only)
router.delete("/:id", instructorOnly, asyncHandler(deleteClass));

// @route   POST /api/classes/:id/join
// @desc    Join a class
// @access  Private
router.post("/:id/join", asyncHandler(joinClass));

// @route   POST /api/classes/:id/leave
// @desc    Leave a class
// @access  Private
router.post("/:id/leave", asyncHandler(leaveClass));

// @route   DELETE /api/classes/:id/members/:userId
// @desc    Remove a member from class
// @access  Private (instructor only)
router.delete(
  "/:id/members/:userId",
  instructorOnly,
  asyncHandler(removeMember)
);

module.exports = router;
