const express = require("express");
const router = express.Router();
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
router.get("/:classId", getClassChat);

// @desc    Delete a chat message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
router.delete("/message/:messageId", deleteMessage);

// @desc    Edit a chat message
// @route   PATCH /api/chat/message/:messageId
// @access  Private
router.patch("/message/:messageId", editMessage);

module.exports = router;
