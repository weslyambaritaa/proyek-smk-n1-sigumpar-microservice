const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();

const {
  getGrades,
  getGradeById,
  saveGrades,
} = require("../controllers/gradeController");

router.get("/", verifyToken, getGrades);
router.get("/:id", verifyToken, getGradeById);
router.post("/save", verifyToken, saveGrades);

module.exports = router;