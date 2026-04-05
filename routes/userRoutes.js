const express = require("express");
const router = express.Router();
const {
  getUser,
  updateProfile,
  deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// @desc    Get public profile
// @route   GET /api/users/:id
// @access  Public
router.get("/:id", getUser);

// @desc    Update own profile
// @route   PATCH /api/users/me
// @access  Private
router.patch("/me", protect, updateProfile);

// @desc    Delete own profile
// @route   DELETE /api/users/me
// @access  Private
router.delete("/me", protect, deleteAccount);

module.exports = router;
