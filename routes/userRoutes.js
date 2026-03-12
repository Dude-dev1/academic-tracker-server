const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { getUser, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// @desc    Get public profile
// @route   GET /api/users/:id
// @access  Public
router.get("/:id", asyncHandler(getUser));

// @desc    Update own profile
// @route   PATCH /api/users/me
// @access  Private
router.patch("/me", protect, asyncHandler(updateProfile));

module.exports = router;
