const express = require('express');
const { loginUser, logoutUser, getMe } = require('../controllers/auth.controller');
const protect = require('../middleware/protect.middleware');

const authRouter = express.Router();

authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/me', protect, getMe);

module.exports = authRouter;
