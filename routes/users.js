const routerUsers = require('express').Router();
const {
  getAllUsers,
  createUser,
  getUserById,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

routerUsers.get('/users', getAllUsers);

routerUsers.post('/users', createUser);

routerUsers.get('/users/:userId', getUserById);

routerUsers.patch('/users/me', updateProfile);

routerUsers.patch('/users/me/avatar', updateAvatar);
// 618ec31488606b72b04354ae
// 618ec39466569be6af15a61f

module.exports = routerUsers;
