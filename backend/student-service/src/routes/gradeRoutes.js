const express = require("express");
<<<<<<< Updated upstream
const verifyToken = require("../middleware/auth");
=======
const extractIdentity = require("../middleware/extractIdentity");
>>>>>>> Stashed changes
const router = express.Router();

const {
  getGrades,
  getGradeById,
  saveGrades,
<<<<<<< Updated upstream
} = require("../controllers/gradeController");

router.get("/", verifyToken, getGrades);
router.get("/:id", verifyToken, getGradeById);
router.post("/save", verifyToken, saveGrades);

module.exports = router;
=======
  updateGrade,
  deleteGrade,
} = require("../controllers/gradeController");

router.get("/", extractIdentity, getGrades);
router.get("/:id", extractIdentity, getGradeById);
router.post("/save", extractIdentity, saveGrades);
router.put("/:id", extractIdentity, updateGrade);
router.delete("/:id", extractIdentity, deleteGrade);

module.exports = router;
>>>>>>> Stashed changes
