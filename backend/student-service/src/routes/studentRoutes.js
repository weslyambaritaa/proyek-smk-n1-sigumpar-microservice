const express = require("express");
const extractIdentity = require("../middleware/extractIdentity");
const rekapController = require("../controllers/rekapAbsensiSiswaController");

const router = express.Router();

router.use(extractIdentity);

router.get("/rekap/absensi", rekapController.getRekapAbsensi);

module.exports = router;
