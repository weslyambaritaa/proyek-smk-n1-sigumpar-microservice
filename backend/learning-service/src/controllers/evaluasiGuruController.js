const getAllEvaluasi   = async (req, res) => res.json({ success: true, data: [] });
const getEvaluasiById  = async (req, res) => res.json({ success: true, data: {} });
const createEvaluasi   = async (req, res) => res.status(201).json({ success: true });
const updateEvaluasi   = async (req, res) => res.json({ success: true });
const deleteEvaluasi   = async (req, res) => res.json({ success: true });
module.exports = { getAllEvaluasi, getEvaluasiById, createEvaluasi, updateEvaluasi, deleteEvaluasi };