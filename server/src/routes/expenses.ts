import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getExpenses);
router.post('/', auth, createExpense);
router.delete('/:id', auth, deleteExpense);

export default router;
