const express = require("express");
const extractIdentity = require("../middleware/extractIdentity");
const router = express.Router();

const {
  getGrades,
  getGradeById,
  saveGrades,
  updateGrade,
  deleteGrade,
} = require("../controllers/gradeController");

router.get("/", extractIdentity, getGrades);
router.get("/:id", extractIdentity, getGradeById);
router.post("/save", extractIdentity, saveGrades);
router.put("/:id", extractIdentity, updateGrade);
router.delete("/:id", extractIdentity, deleteGrade);

module.exports = router;
