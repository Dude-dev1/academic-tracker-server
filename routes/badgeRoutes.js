const express = require("express");
const router = express.Router();
const {
  awardBadge,
  getUserBadges,
  getAllBadges,
} = require("../controllers/badgeController");
const { protect } = require("../middleware/auth");

// @desc    Award a badge to a user
// @route   POST /api/badges/award
// @access  Private
router.post("/award", protect, awardBadge);

// @desc    Get all badges for a user
// @route   GET /api/users/:userId/badges
// @access  Public
router.get("/users/:userId/badges", getUserBadges);

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Public
router.get("/", getAllBadges);

module.exports = router;
