const express = require("express");
const router = express.Router();
const { getUser, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// @desc    Get public profile
// @route   GET /api/users/:id
// @access  Public
router.get("/:id", getUser);

// @desc    Update own profile
// @route   PATCH /api/users/me
// @access  Private
router.patch("/me", protect, updateProfile);

module.exports = router;
