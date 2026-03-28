const Announcement = require("../models/Announcement");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendAnnouncementEmail } = require("../utils/emailService");

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements,
  });
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (e.g. instructor or admin)
exports.createAnnouncement = asyncHandler(async (req, res) => {
  req.body.userId = req.user.id;

  if (req.user.role !== "instructor" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to create announcements");
  }

  const announcement = await Announcement.create(req.body);

  // Send email to all students
  const students = await User.find({ role: "student" }).select("email");
  if (students.length > 0) {
    sendAnnouncementEmail(students, {
      title: announcement.title,
      content: announcement.body,
    });
  }

  res.status(201).json({
    success: true,
    data: announcement,
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (instructor only)
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  if (
    announcement.userId.toString() !== req.user.id &&
    req.user.role !== "admin" &&
    req.user.role !== "instructor"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this announcement");
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (instructor only)
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  // Make sure user is the author, admin, or instructor
  if (
    announcement.userId.toString() !== req.user.id &&
    req.user.role !== "admin" &&
    req.user.role !== "instructor"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this announcement");
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: announcement,
  });
});
