const Assignment = require("../models/Assignment");
const Class = require("../models/Class");
const User = require("../models/User");

// Get all assignments for a user (student or instructor view)
exports.getAllByUser = async (userId, userRole) => {
  let query;

  if (userRole === "student") {
    // Students see assignments from classes they're in
    const classes = await Class.find({ members: userId }).select("_id");
    const classIds = classes.map((c) => c._id);
    query = { classId: { $in: classIds } };
  } else {
    // Instructors see assignments they created
    query = { createdBy: userId };
  }

  return await Assignment.find(query)
    .populate("classId", "name code")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1 });
};

// Create new assignment
exports.create = async (assignmentData, userId) => {
  // Add creator info
  assignmentData.createdBy = userId;

  const assignment = await Assignment.create(assignmentData);

  // Populate and return
  return await assignment.populate("classId createdBy");
};

// Get assignment by ID
exports.findById = async (assignmentId) => {
  return await Assignment.findById(assignmentId)
    .populate("classId", "name code")
    .populate("createdBy", "name email");
};

// Update assignment
exports.update = async (assignmentId, updateData) => {
  return await Assignment.findByIdAndUpdate(assignmentId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("classId", "name code")
    .populate("createdBy", "name email");
};

// Delete assignment
exports.delete = async (assignmentId) => {
  return await Assignment.findByIdAndDelete(assignmentId);
};

// Get assignments by class
exports.getByClassId = async (classId) => {
  return await Assignment.find({ classId })
    .populate("createdBy", "name email")
    .sort({ dueDate: 1 });
};

// Check if user is assignment creator
exports.isCreator = async (assignmentId, userId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return false;
  return assignment.createdBy.toString() === userId;
};

// Check if user can access assignment (is in the class)
exports.canAccess = async (assignmentId, userId) => {
  const assignment = await Assignment.findById(assignmentId).populate(
    "classId"
  );
  if (!assignment) return false;

  const classItem = assignment.classId;
  return (
    classItem.members.includes(userId) ||
    classItem.instructorId.toString() === userId
  );
};
