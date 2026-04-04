const express = require("express");
const router = express.Router();
const extractIdentity = require("../middleware/extractIdentity");
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getAllPerangkat,
  uploadPerangkat,
  downloadPerangkat,
  deletePerangkat,
} = require("../controllers/learningController");
const {
  getAllAbsensiGuru,
  getAbsensiGuruById,
  createAbsensiGuru,
  updateAbsensiGuru,
  deleteAbsensiGuru,
} = require("../controllers/absensiGuruController");

router.use(extractIdentity);

router.route("/todos").get(getAllTodos).post(createTodo);
router.route("/todos/:id").get(getTodoById).put(updateTodo).delete(deleteTodo);

router.route("/absensi-guru").get(getAllAbsensiGuru).post(createAbsensiGuru);
router.route("/absensi-guru/:id").get(getAbsensiGuruById).put(updateAbsensiGuru).delete(deleteAbsensiGuru);

router.route("/perangkat").get(getAllPerangkat).post(uploadPerangkat);
router.get("/perangkat/:id/download", downloadPerangkat);
router.get("/perangkat/:id/view", downloadPerangkat);   // alias untuk preview inline
router.delete("/perangkat/:id", deletePerangkat);

module.exports = router;
