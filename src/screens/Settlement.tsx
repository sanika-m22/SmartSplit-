import React, { useMemo, useState } from 'react';
import { ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { fetchExpenses, fetchUsers } from '../api/apiClient';
import { calculateNetBalances, calculateSettlements } from '../utils/balances';

export const Settlement: React.FC = () => {
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currency, setCurrency] = useState('₹');

  React.useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) setCurrency(JSON.parse(saved).currency || '₹');

    const getData = async () => {
      try {
        const { data: expData } = await fetchExpenses();
        const { data: userData } = await fetchUsers();
        setExpenses(expData);
        setUsers(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const getUserName = (id: string) => users.find(u => u._id === id)?.name || id;

  const settlements = useMemo(() => {
    if (loading) return [];
    const normalizedUsers = users.map(u => ({ ...u, id: u._id }));
    const normalizedExpenses = expenses.map(e => ({ 
      ...e, 
      id: e._id,
      paidBy: typeof e.paidBy === 'object' ? e.paidBy._id : e.paidBy,
      splitAmong: e.splitAmong.map((s: any) => {
        if (typeof s === 'object' && s.user) {
          return {
            user: typeof s.user === 'object' ? s.user._id : s.user,
            amount: s.amount
          };
        }
        return s;
      })
    }));
    const netBalances = calculateNetBalances(normalizedExpenses, normalizedUsers);
    return calculateSettlements(netBalances);
  }, [expenses, users, loading]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Calculating settlements...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Settlements</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Simplified debt calculations</p>
        </div>
        <button className="btn-secondary">
          <Download size={18} /> Export
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {settlements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>You're all settled up!</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>No pending balances in this group.</p>
          </div>
        ) : (
          settlements.map((balance, idx) => (
            <div key={idx} className="card glass-panel ai-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem', borderRadius: '20px', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', flex: 1, textAlign: 'right', fontFamily: 'var(--font-heading)' }}>
                  {getUserName(balance.from)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.25rem' }}>transfer</span>
                  <ArrowRight size={24} style={{ color: 'var(--color-secondary)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', flex: 1, fontFamily: 'var(--font-heading)' }}>
                  {getUserName(balance.to)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>amount</div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                  {currency}{balance.amount}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
