const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} = require("../controllers/announcementController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").get(getAnnouncements).post(createAnnouncement);
router.route("/:id").put(updateAnnouncement).delete(deleteAnnouncement);

module.exports = router;
