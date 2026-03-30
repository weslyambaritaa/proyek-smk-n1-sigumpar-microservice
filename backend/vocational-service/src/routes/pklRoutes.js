const express      = require("express");
const router       = express.Router();
const extractIdentity = require("../middleware/extractIdentity");
const pklCtrl      = require("../controllers/pklController");

router.use(extractIdentity);

router.get("/submissions",              pklCtrl.getAllPKL);
router.post("/submissions",             pklCtrl.createSubmission);
router.put("/submissions/:id/validate", pklCtrl.validateAndApprovePKL);

module.exports = router;
