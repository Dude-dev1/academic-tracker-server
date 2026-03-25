const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      uppercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    tutorName: {
      type: String,
      required: [true, "Tutor name is required"],
      trim: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ code: 1 });
courseSchema.index({ instructorId: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
