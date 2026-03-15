const Badge = require("../models/Badge");
const User = require("../models/User");

// @desc    Award a badge to a user
// @route   POST /api/badges/award
// @access  Private
exports.awardBadge = async (req, res) => {
  try {
    const { badgeId, userId } = req.body;

    // Validate inputs
    if (!badgeId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Badge ID and User ID are required",
      });
    }

    // Check if badge exists
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge not found",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already has this badge
    if (user.badges.includes(badgeId)) {
      return res.status(400).json({
        success: false,
        message: "User already has this badge",
      });
    }

    // Award badge
    user.badges.push(badgeId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Badge awarded successfully",
      data: {
        badge: badge.toJSON(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all badges for a user
// @route   GET /api/users/:userId/badges
// @access  Public
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId).populate("badges");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.badges.length,
      data: user.badges.map((badge) => badge.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Public
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({});

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges.map((badge) => badge.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
