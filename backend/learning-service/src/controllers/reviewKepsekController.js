const pool = require("../config/db");
const getAllReviewKepsek   = async (req, res) => res.json({ success: true, data: [] });
const getReviewKepsekById  = async (req, res) => res.json({ success: true, data: {} });
const createReviewKepsek   = async (req, res) => res.status(201).json({ success: true });
const updateReviewKepsek   = async (req, res) => res.json({ success: true });
const deleteReviewKepsek   = async (req, res) => res.json({ success: true });
module.exports = { getAllReviewKepsek, getReviewKepsekById, createReviewKepsek, updateReviewKepsek, deleteReviewKepsek };