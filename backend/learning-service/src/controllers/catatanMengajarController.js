const getCatatanSaya = async (req, res) => res.json({ success: true, data: [] });
const getAllCatatan  = async (req, res) => res.json({ success: true, data: [] });
const getCatatanById = async (req, res) => res.json({ success: true, data: {} });
const createCatatan  = async (req, res) => res.status(201).json({ success: true });
const updateCatatan  = async (req, res) => res.json({ success: true });
const deleteCatatan  = async (req, res) => res.json({ success: true });
module.exports = { getCatatanSaya, getAllCatatan, getCatatanById, createCatatan, updateCatatan, deleteCatatan };