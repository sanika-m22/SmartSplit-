import mongoose, { Schema, Document } from 'mongoose';

export interface ISplitMember {
  user: mongoose.Types.ObjectId;
  amount: number;
}

export interface IExpense extends Document {
  title: string;
  amount: number;
  paidBy: mongoose.Types.ObjectId;
  splitAmong: ISplitMember[];
  category: 'Food' | 'Travel' | 'Shopping' | 'Stay' | 'Other';
  date: Date;
  groupId: mongoose.Types.ObjectId;
}

const ExpenseSchema: Schema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  splitAmong: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }
  }],
  category: { 
    type: String, 
    enum: ['Food', 'Travel', 'Shopping', 'Stay', 'Other'], 
    default: 'Other' 
  },
  date: { type: Date, default: Date.now },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
