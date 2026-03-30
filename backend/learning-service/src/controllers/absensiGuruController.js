const pool = require("../config/db");
const getRekapAbsensi = async (req, res) => res.json({ success: true, data: [] });
const getAbsensiSaya  = async (req, res) => res.json({ success: true, data: [] });
const getAllAbsensi   = async (req, res) => res.json({ success: true, data: [] });
const getAbsensiById  = async (req, res) => res.json({ success: true, data: {} });
const createAbsensi   = async (req, res) => res.status(201).json({ success: true });
const updateAbsensi   = async (req, res) => res.json({ success: true });
const deleteAbsensi   = async (req, res) => res.json({ success: true });
module.exports = { getRekapAbsensi, getAbsensiSaya, getAllAbsensi, getAbsensiById, createAbsensi, updateAbsensi, deleteAbsensi };