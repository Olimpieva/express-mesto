const routerUsers = require('express').Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

routerUsers.get('/users', getAllUsers);

routerUsers.get('/users/me', getUserById);

routerUsers.get('/users/:userId', getUserById);

routerUsers.patch('/users/me', updateProfile);

routerUsers.patch('/users/me/avatar', updateAvatar);

module.exports = routerUsers;
