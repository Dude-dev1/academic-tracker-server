const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Class code is required"],
      uppercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for faster queries
classSchema.index({ code: 1 });
classSchema.index({ instructorId: 1 });

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
