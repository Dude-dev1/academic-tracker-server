const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Urgent", "Important", "Normal", "Completed", "Prep"],
      default: "Normal",
    },
    color: {
      type: String,
      default: "#2563EB",
    },
    isClass: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
