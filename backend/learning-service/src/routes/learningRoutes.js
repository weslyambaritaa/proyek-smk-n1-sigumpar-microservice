const express = require("express")
const router = express.Router()

const {
  getAllReviewWakasek,
  createReviewWakasek
} = require("../controllers/wakasekController")

/*
Wakasek Endpoint
*/

router.get("/wakasek/review", getAllReviewWakasek)

router.post("/wakasek/review", createReviewWakasek)

module.exports = router