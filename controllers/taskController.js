const Task = require("../models/Task");

// @desc    Create a personal task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const taskData = {
      userId: req.user.id,
      title,
      description,
      dueDate,
      priority: priority || "medium",
    };

    const task = await Task.create(taskData);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get personal tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { completed } = req.query;

    let query = { userId: req.user.id };

    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks.map((t) => t),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user owns the task
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a task
// @route   PATCH /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user owns the task
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const { title, description, dueDate, priority, completed } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (completed !== undefined) task.completed = completed;

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user owns the task
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark task as complete
// @route   PATCH /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user owns the task
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this task",
      });
    }

    task.completed = true;
    await task.save();

    // Check for new badges after task completion
    const badgeService = require("../services/badgeService");
    const newlyEarnedBadges = await badgeService.checkAllBadgesForUser(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Task completed successfully",
      data: task,
      newlyEarnedBadges: newlyEarnedBadges.map((badge) => badge),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
