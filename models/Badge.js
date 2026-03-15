const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Badge name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Badge description is required"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Badge icon is required"],
      trim: true,
    },
    criteria_type: {
      type: String,
      required: [true, "Criteria type is required"],
      enum: ["assignment_count", "class_attendance", "streak_days"],
    },
    criteria_value: {
      type: Number,
      required: [true, "Criteria value is required"],
      min: [1, "Criteria value must be at least 1"],
    },
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;
