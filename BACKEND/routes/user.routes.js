const express = require('express');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.use(protect);

userRouter.get('/profile', getProfile);
userRouter.put('/profile', updateProfile);
userRouter.put('/change-password', changePassword);

userRouter.use(authorize('admin'));

userRouter.post('/', validate(['name', 'email', 'password', 'role']), createUser);
userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

module.exports = userRouter;
