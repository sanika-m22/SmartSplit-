export interface User {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  paidBy: string | User;
  splitAmong: (string | User)[];
  category: string;
  date: string;
  createdAt?: string;
}

// Demo dataset removed.
export const users: User[] = [];
export const expenses: Expense[] = [];
export const calculatedBalances: any[] = [];
