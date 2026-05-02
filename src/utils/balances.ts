import type { Expense, User, Balance } from '../data/mockData';

export const calculateNetBalances = (expenses: any[], users: any[]): Record<string, number> => {
  const netBalances: Record<string, number> = {};
  
  users.forEach(u => {
    const id = u.id || u._id;
    netBalances[id] = 0;
  });

  expenses.forEach(exp => {
    const paidById = typeof exp.paidBy === 'object' ? (exp.paidBy._id || exp.paidBy.id) : exp.paidBy;
    
    // Person who paid gets the amount added to their balance
    if (netBalances[paidById] !== undefined) {
      netBalances[paidById] += exp.amount;
    }
    
    // Each person involved in the split has their share deducted
    exp.splitAmong.forEach((split: any) => {
      const userId = typeof split === 'object' ? (split.user?._id || split.user?.id || split.user) : split;
      const share = typeof split === 'object' && split.amount !== undefined 
        ? split.amount 
        : (exp.amount / exp.splitAmong.length);

      if (netBalances[userId] !== undefined) {
        netBalances[userId] -= share;
      }
    });
  });

  return netBalances;
};

export const calculateSettlements = (netBalances: Record<string, number>): Balance[] => {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(netBalances).forEach(([id, balance]) => {
    if (balance < -0.01) debtors.push({ id, amount: -balance });
    else if (balance > 0.01) creditors.push({ id, amount: balance });
  });

  // Sort them to optimize a bit (largest debts first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Balance[] = [];

  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);
    
    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: Number(amount.toFixed(2))
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};

export const getUserSummary = (userId: string, settlements: Balance[]) => {
  let youOwe = 0;
  let youGetBack = 0;

  settlements.forEach(s => {
    if (s.from === userId) youOwe += s.amount;
    if (s.to === userId) youGetBack += s.amount;
  });

  return { youOwe, youGetBack };
};
