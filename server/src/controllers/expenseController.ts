import { Request, Response } from 'express';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { AuthRequest } from '../middleware/auth.js';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    // First, find all groups the user is a member of
    const userGroups = await Group.find({ members: req.userId as string }).select('_id');
    const activeGroupIds = userGroups.map(g => g._id);

    const expenses = await Expense.find({
      groupId: { $in: activeGroupIds },
      $or: [
        { paidBy: req.userId as string },
        { 'splitAmong.user': req.userId as string }
      ]
    }).populate('paidBy', 'name avatar').populate('splitAmong.user', 'name avatar');

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, splitAmong, category, date, groupId } = req.body;
    
    const newExpense = new Expense({
      title,
      amount,
      paidBy: req.userId,
      splitAmong,
      category,
      date: date || new Date(),
      groupId
    });

    await newExpense.save();
    
    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('paidBy', 'name avatar')
      .populate('splitAmong.user', 'name avatar');

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};
