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
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
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

// Keep these indexes - they're good for performance
assignmentSchema.index({ classId: 1 });
assignmentSchema.index({ dueDate: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
