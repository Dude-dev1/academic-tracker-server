const Badge = require("../models/Badge");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const Class = require("../models/Class");
const Task = require("../models/Task");

// Check and award badges based on assignment count
exports.checkAssignmentCountBadges = async (userId) => {
  // Get all badges for assignment count criteria
  const assignmentBadges = await Badge.find({
    criteria_type: "assignment_count",
  });

  // Get user
  const user = await User.findById(userId);
  if (!user) return [];

  // Count completed assignments for this user
  // Since there's no explicit assignment submission model, we'll use completed tasks as a proxy
  const assignmentCount = await Task.countDocuments({
    userId: userId,
    completed: true,
  });

  const newlyEarnedBadges = [];

  for (const badge of assignmentBadges) {
    // Check if user already has this badge
    if (user.badges.includes(badge._id)) continue;

    // Check if user meets criteria
    if (assignmentCount >= badge.criteria_value) {
      // Award badge
      user.badges.push(badge._id);
      newlyEarnedBadges.push(badge);
    }
  }

  if (newlyEarnedBadges.length > 0) {
    await user.save();
  }

  return newlyEarnedBadges;
};

// Check and award badges based on streak days
exports.checkStreakBadges = asyncHandler(async (userId) => {
  // Get all badges for streak criteria
  const streakBadges = await Badge.find({
    criteria_type: "streak_days",
  });

  // Get user
  const user = await User.findById(userId);
  if (!user) return [];

  // Calculate current streak based on task completion dates
  const streakDays = await calculateCurrentStreak(userId);

  const newlyEarnedBadges = [];

  for (const badge of streakBadges) {
    // Check if user already has this badge
    if (user.badges.includes(badge._id)) continue;

    // Check if user meets criteria
    if (streakDays >= badge.criteria_value) {
      // Award badge
      user.badges.push(badge._id);
      newlyEarnedBadges.push(badge);
    }
  }

  if (newlyEarnedBadges.length > 0) {
    await user.save();
  }

  return newlyEarnedBadges;
});

// Check and award badges based on class attendance
// Note: Since there's no explicit attendance tracking, we'll use class membership as a proxy
exports.checkClassAttendanceBadges = asyncHandler(async (userId) => {
  // Get all badges for class attendance criteria
  const attendanceBadges = await Badge.find({
    criteria_type: "class_attendance",
  });

  // Get user
  const user = await User.findById(userId);
  if (!user) return [];

  // Count classes user is a member of
  const classCount = user.classes.length;

  const newlyEarnedBadges = [];

  for (const badge of attendanceBadges) {
    // Check if user already has this badge
    if (user.badges.includes(badge._id)) continue;

    // Check if user meets criteria
    if (classCount >= badge.criteria_value) {
      // Award badge
      user.badges.push(badge._id);
      newlyEarnedBadges.push(badge);
    }
  }

  if (newlyEarnedBadges.length > 0) {
    await user.save();
  }

  return newlyEarnedBadges;
});

// Helper function to calculate current streak based on task completion dates
async function calculateCurrentStreak(userId) {
  // Get all completed tasks for the user, sorted by completion date descending
  const completedTasks = await Task.find({
    userId: userId,
    completed: true,
  }).sort({ updatedAt: -1 });

  if (completedTasks.length === 0) return 0;

  // Calculate streak based on consecutive days of task completion
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to start of day

  // Group tasks by completion date
  const completionDates = {};
  completedTasks.forEach((task) => {
    const date = new Date(task.updatedAt);
    date.setHours(0, 0, 0, 0);
    const dateString = date.toISOString().split("T")[0];
    if (!completionDates[dateString]) {
      completionDates[dateString] = 0;
    }
    completionDates[dateString]++;
  });

  // Check for consecutive days from today backwards
  let checkDate = new Date(currentDate);
  while (true) {
    const dateString = checkDate.toISOString().split("T")[0];
    if (completionDates[dateString] && completionDates[dateString] > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Main function to check all badge types for a user
exports.checkAllBadgesForUser = asyncHandler(async (userId) => {
  const assignmentBadges = await this.checkAssignmentCountBadges(userId);
  const streakBadges = await this.checkStreakBadges(userId);
  const attendanceBadges = await this.checkClassAttendanceBadges(userId);

  return [...assignmentBadges, ...streakBadges, ...attendanceBadges];
});
