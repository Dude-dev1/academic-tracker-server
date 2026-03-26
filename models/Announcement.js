const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Announcement body is required"],
    },
    date: {
      type: String, 
      default: () => `Posted ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    iconColor: {
      type: String,
      default: "#2563EB",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
