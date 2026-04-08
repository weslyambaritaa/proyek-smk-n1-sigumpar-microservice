const express = require('express');
const router = express.Router();
const extractIdentity = require('../middleware/extractIdentity');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/studentController');

router.get('/',    extractIdentity, getAllUsers);
router.post('/',   extractIdentity, createUser);
router.get('/:id', extractIdentity, getUserById);
router.put('/:id', extractIdentity, updateUser);
router.delete('/:id', extractIdentity, deleteUser);

module.exports = router;