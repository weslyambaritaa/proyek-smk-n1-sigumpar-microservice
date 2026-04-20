const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/studentController');

router.get('/',     getAllUsers);
router.post('/',    createUser);
router.get('/:id',  getUserById);
router.put('/:id',  updateUser);
router.delete('/:id', deleteUser);

module.exports = router;