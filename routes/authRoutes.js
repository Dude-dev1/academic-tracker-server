const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", login);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, getMe);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", protect, updateProfile);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, logout);

// @desc    Google OAuth routes
// @route   GET /api/auth/google
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: (process.env.FRONTEND_URL || "http://localhost:5173") + "/login", session: false }),
  (req, res) => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/google-callback?token=${token}`);
  }
);

module.exports = router;