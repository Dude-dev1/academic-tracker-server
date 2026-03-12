const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
router.get("/", asyncHandler(getNotifications));

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
router.patch("/read-all", asyncHandler(markAllAsRead));

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch("/:id/read", asyncHandler(markAsRead));

module.exports = router;
