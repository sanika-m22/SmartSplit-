import express from 'express';
import { getUsers } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getUsers);

export default router;
