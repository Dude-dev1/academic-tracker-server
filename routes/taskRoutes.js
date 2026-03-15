const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// @desc    Create personal task
// @route   POST /api/tasks
// @access  Private
router.post("/", createTask);

// @desc    Get personal tasks
// @route   GET /api/tasks
// @access  Private
router.get("/", getTasks);

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get("/:id", getTask);

// @desc    Update task
// @route   PATCH /api/tasks/:id
// @access  Private
router.patch("/:id", updateTask);

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete("/:id", deleteTask);

// @desc    Mark task as complete
// @route   PATCH /api/tasks/:id/complete
// @access  Private
router.patch("/:id/complete", completeTask);

module.exports = router;
