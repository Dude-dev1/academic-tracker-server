const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    group: {
      type: String,
      enum: ["All", "Group 1", "Group 2"],
      default: "All",
    },
    status: {
      type: String,
      enum: ["open", "closed", "overdue", "completed"],
      default: "open",
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    points: {
      type: Number,
      default: 100,
      min: 0,
    },
  },
  {
    timestamps: true, // This still adds createdAt and updatedAt automatically
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
