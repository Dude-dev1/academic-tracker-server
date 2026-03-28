const CalendarEvent = require("../models/CalendarEvent");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all calendar events for user
// @route   GET /api/calendar-events
// @access  Private
exports.getEvents = asyncHandler(async (req, res) => {
  const events = await CalendarEvent.find({ 
    $or: [{ userId: req.user._id }, { isClass: true }] 
  });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Create new calendar event
// @route   POST /api/calendar-events
// @access  Private
exports.createEvent = asyncHandler(async (req, res) => {
  if (req.body.isClass && req.user.role !== "instructor" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only instructors can create class events" });
  }

  req.body.userId = req.user._id;

  const event = await CalendarEvent.create(req.body);

  res.status(201).json({
    success: true,
    data: event,
  });
});

// @desc    Update calendar event
// @route   PUT /api/calendar-events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await CalendarEvent.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (req.body.isClass && req.user.role !== "instructor" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only instructors can update class events" });
  }

  // Make sure user owns event
  if (event.userId.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to update this event" });
  }

  event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Delete calendar event
// @route   DELETE /api/calendar-events/:id
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Make sure user owns event
  if (event.userId.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to delete this event" });
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
