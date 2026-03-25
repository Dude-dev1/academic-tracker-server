const express = require("express");
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/").get(protect, getCourses).post(protect, createCourse);

router.route("/:id").put(protect, updateCourse).delete(protect, deleteCourse);

module.exports = router;
