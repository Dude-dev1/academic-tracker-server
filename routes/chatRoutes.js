const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const {
  getClassChat,
  deleteMessage,
  editMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @desc    Get chat messages for a class
// @route   GET /api/chat/:classId
// @access  Private
router.get("/:classId", asyncHandler(getClassChat));

// @desc    Delete a chat message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
router.delete("/message/:messageId", asyncHandler(deleteMessage));

// @desc    Edit a chat message
// @route   PATCH /api/chat/message/:messageId
// @access  Private
router.patch("/message/:messageId", asyncHandler(editMessage));

module.exports = router;
