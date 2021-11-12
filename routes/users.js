const routerUsers = require('express').Router();
const { getAllUsers, createUser, getUserById } = require('../controllers/users');

routerUsers.get('/users', getAllUsers);

routerUsers.post('/users', createUser);

routerUsers.get('/users/:userId', getUserById);

module.exports = routerUsers;
