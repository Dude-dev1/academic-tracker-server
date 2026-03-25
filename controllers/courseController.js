const Course = require("../models/Course");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor only)
exports.createCourse = asyncHandler(async (req, res) => {
  req.body.instructorId = req.user.id;

  if (req.user.role !== "instructor") {
    res.status(403);
    throw new Error("Not authorized to create a course");
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor only)
exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (
    course.instructorId.toString() !== req.user.id &&
    req.user.role !== "instructor"
  ) {
    res.status(403);
    throw new Error("User not authorized to update this course");
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor only)
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (
    course.instructorId.toString() !== req.user.id &&
    req.user.role !== "instructor"
  ) {
    res.status(403);
    throw new Error("User not authorized to delete this course");
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
