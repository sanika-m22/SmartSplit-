import express from 'express';
import { createGroup, joinGroup, getUserGroups, getGroupDetails, deleteGroup } from '../controllers/groupController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createGroup);
router.post('/join', auth, joinGroup);
router.get('/', auth, getUserGroups);
router.get('/:id', auth, getGroupDetails);
router.delete('/:id', auth, deleteGroup);

export default router;
