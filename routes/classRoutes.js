const express = require("express");
const router = express.Router();
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
  addMember,
  removeMember,
  regenerateCode,
  archiveClass,
} = require("../controllers/classController");
const { protect, instructorOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (instructor only)
router.post("/", instructorOnly, createClass);

// @route   GET /api/classes
// @desc    Get all classes for current user
// @access  Private
router.get("/", getClasses);

// @route   POST /api/classes/join
// @desc    Join class by code
// @access  Private
router.post("/join", joinClassByCode);

// @route   GET /api/classes/:id
// @desc    Get single class
// @access  Private
router.get("/:id", getClass);

// @route   GET /api/classes/:id/members
// @desc    Get class members
// @access  Private
router.get("/:id/members", getMembers);

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (instructor only)
router.put("/:id", instructorOnly, updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (instructor only)
router.delete("/:id", instructorOnly, deleteClass);

// @route   POST /api/classes/:id/join
// @desc    Join a class
// @access  Private
router.post("/:id/join", joinClass);

// @route   POST /api/classes/:id/leave
// @desc    Leave a class
// @access  Private
router.post("/:id/leave", leaveClass);

// @route   POST /api/classes/:id/members
// @desc    Add a member to class manually
// @access  Private (instructor only)
router.post("/:id/members", instructorOnly, addMember);

// @route   DELETE /api/classes/:id/members/:userId
// @desc    Remove a member from class
// @access  Private (instructor only)
router.delete("/:id/members/:userId", instructorOnly, removeMember);

// @route   PUT /api/classes/:id/regenerate
// @desc    Regenerate Class Code
// @access  Private (instructor only)
router.put("/:id/regenerate", instructorOnly, regenerateCode);

// @route   PUT /api/classes/:id/archive
// @desc    Archive Class
// @access  Private (instructor only)
router.put("/:id/archive", instructorOnly, archiveClass);

module.exports = router;
