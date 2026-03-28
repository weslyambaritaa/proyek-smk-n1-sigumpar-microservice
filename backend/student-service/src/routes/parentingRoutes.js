const express = require("express");
const verifyToken = require("../middleware/auth");
const parentingUpload = require("../middleware/parentingUpload");

const {
  createParentingMeeting,
  getAllParentingMeetings,
  getParentingMeetingById,
  updateParentingMeeting,
  deleteParentingMeeting,
} = require("../controllers/parentingController");

const router = express.Router();

router
  .route("/")
  .get(verifyToken, getAllParentingMeetings)
  .post(verifyToken, parentingUpload.single("attachment"), createParentingMeeting);

router
  .route("/:id")
  .get(verifyToken, getParentingMeetingById)
  .put(verifyToken, parentingUpload.single("attachment"), updateParentingMeeting)
  .delete(verifyToken, deleteParentingMeeting);

module.exports = router;