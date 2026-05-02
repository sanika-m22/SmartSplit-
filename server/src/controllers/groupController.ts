import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newGroup = new Group({
      name,
      description,
      createdBy: req.userId,
      members: [req.userId],
      inviteCode
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.some(memberId => memberId.toString() === req.userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push(req.userId as any);
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error joining group', error });
  }
};

export const getUserGroups = async (req: AuthRequest, res: Response) => {
  try {
    const groups = await Group.find({ members: req.userId as string }).populate('members', 'name email avatar');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

export const getGroupDetails = async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email avatar');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group details', error });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only the creator or a member can delete (for now let's allow any member to simplify)
    // In a real app, you might restrict this to the owner.
    if (!group.members.some(memberId => memberId.toString() === req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this group' });
    }

    await Group.findByIdAndDelete(id);
    
    // Explicitly handle string vs ObjectId for groupId in deletion
    const deleteResult = await Expense.deleteMany({ 
      $or: [
        { groupId: id },
        { groupId: new mongoose.Types.ObjectId(id) }
      ]
    });

    console.log(`Group ${id} deleted. Removed ${deleteResult.deletedCount} associated expenses.`);

    res.status(200).json({ message: 'Group deleted successfully', deletedExpenses: deleteResult.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group', error });
  }
};
