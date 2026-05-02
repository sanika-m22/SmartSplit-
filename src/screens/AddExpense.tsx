import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, CheckCircle, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchUsers, fetchGroups, fetchGroupDetails, createExpense as apiCreateExpense } from '../api/apiClient';
import { useLocation } from 'react-router-dom';
import styles from './AddExpense.module.css';

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialGroupId = queryParams.get('group');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState(initialGroupId || '');
  const [paidBy, setPaidBy] = useState('');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [splitDetails, setSplitDetails] = useState<Record<string, string>>({});
  const [category, setCategory] = useState('Other');

  useEffect(() => {
    // Reset split details when users list changes
    const initialSplits: Record<string, string> = {};
    usersList.forEach(u => {
      initialSplits[u._id || u.id] = '';
    });
    setSplitDetails(initialSplits);
  }, [usersList]);

  const handleSplitDetailChange = (userId: string, value: string) => {
    setSplitDetails(prev => ({ ...prev, [userId]: value }));
  };
  const [isAiSuggested, setIsAiSuggested] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: userData } = await fetchUsers();
        const { data: groupData } = await fetchGroups();
        
        setUsersList(userData);
        setGroups(groupData);

        if (initialGroupId) {
          setGroupId(initialGroupId);
          const { data: selectedGroup } = await fetchGroupDetails(initialGroupId);
          setUsersList(selectedGroup.members);
        } else if (groupData.length > 0) {
          setGroupId(groupData[0]._id);
          const { data: selectedGroup } = await fetchGroupDetails(groupData[0]._id);
          setUsersList(selectedGroup.members);
        }

        if (userData.length > 0) {
          const profile = JSON.parse(localStorage.getItem('profile') || '{}');
          const currentUserId = profile?.result?.id || profile?.result?._id;
          setPaidBy(currentUserId || userData[0]._id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    getData();
  }, [initialGroupId]);

  const handleGroupChange = async (newGroupId: string) => {
    setGroupId(newGroupId);
    try {
      const { data: selectedGroup } = await fetchGroupDetails(newGroupId);
      setUsersList(selectedGroup.members);
    } catch (err) {
      console.error('Error switching group:', err);
    }
  };

  // AI Categorization Logic
  useEffect(() => {
    const categories: Record<string, string[]> = {
      'Food': ['burger', 'pizza', 'dinner', 'lunch', 'restaurant', 'cafe', 'starbucks', 'kfc', 'mcdonald'],
      'Travel': ['uber', 'taxi', 'flight', 'train', 'bus', 'petrol', 'fuel', 'ola'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'concert', 'party', 'game'],
      'Shopping': ['amazon', 'myntra', 'zara', 'clothes', 'shoes', 'iphone', 'gadget'],
      'Stay': ['hotel', 'airbnb', 'oyo', 'room', 'rent'],
    };

    const lowerTitle = title.toLowerCase();
    let suggested = false;

    if (!lowerTitle) {
      setCategory('Other');
      setIsAiSuggested(false);
      return;
    }

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => lowerTitle.includes(k))) {
        setCategory(cat);
        setIsAiSuggested(true);
        suggested = true;
        break;
      }
    }

    if (!suggested) {
      setCategory('Other');
      setIsAiSuggested(false);
    }
  }, [title]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      alert('Please select a group first');
      return;
    }

    let finalSplitAmong: any[] = [];
    const numAmount = parseFloat(amount);

    if (splitMethod === 'equal') {
      const share = numAmount / usersList.length;
      finalSplitAmong = usersList.map(u => ({ user: u._id || u.id, amount: share }));
    } else if (splitMethod === 'exact') {
      let total = 0;
      finalSplitAmong = usersList.map(u => {
        const val = parseFloat(splitDetails[u._id || u.id] || '0');
        total += val;
        return { user: u._id || u.id, amount: val };
      });
      if (Math.abs(total - numAmount) > 0.1) {
        alert(`Total of exact amounts (₹${total}) must equal the total expense (₹${numAmount})`);
        return;
      }
    } else if (splitMethod === 'percentages') {
      let totalPercent = 0;
      finalSplitAmong = usersList.map(u => {
        const percent = parseFloat(splitDetails[u._id || u.id] || '0');
        totalPercent += percent;
        return { user: u._id || u.id, amount: (percent / 100) * numAmount };
      });
      if (Math.abs(totalPercent - 100) > 0.1) {
        alert(`Total percentage (${totalPercent}%) must equal 100%`);
        return;
      }
    }

    try {
      await apiCreateExpense({
        title,
        amount: numAmount,
        paidBy,
        groupId,
        splitAmong: finalSplitAmong, 
        category,
        date: new Date()
      });
      navigate(`/dashboard?group=${groupId}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };



  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-box" style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: '12px' }}>
            <Receipt size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Add Expense</h2>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--color-text-muted)' }}><X /></button>
      </div>

      <div className={styles.formArea}>
          <form onSubmit={handleAddExpense} className="card ai-glow" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
              <input
                type="text"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
                placeholder="e.g. Starbucks coffee"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGrid}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Amount (₹)</label>
                <input
                  type="number"
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Category
                  {isAiSuggested && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ fontSize: '0.65rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                    >
                      <Sparkles size={10} /> AI Suggested
                    </motion.span>
                  )}
                </label>
                <select
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none', appearance: 'none' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Other</option>
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Entertainment</option>
                  <option>Shopping</option>
                  <option>Stay</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Group</label>
                <select
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
                  value={groupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Group</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Paid By</label>
                <select
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {usersList.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Split Method</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['equal', 'exact', 'percentages'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSplitMethod(method)}
                    style={{ 
                      flex: 1, 
                      padding: '0.75rem', 
                      borderRadius: '10px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      textTransform: 'capitalize',
                      transition: 'all 0.2s',
                      background: splitMethod === method ? 'var(--color-primary)' : 'white',
                      color: splitMethod === method ? 'white' : 'var(--color-text-main)',
                      border: splitMethod === method ? 'none' : '1px solid #eee'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {splitMethod !== 'equal' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '16px' }}
                >
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Set {splitMethod} shares
                  </p>
                  {usersList.map(user => (
                    <div key={user._id || user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</span>
                      <div style={{ position: 'relative', width: '120px' }}>
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {splitMethod === 'exact' ? '₹' : '%'}
                        </span>
                        <input
                          type="number"
                          value={splitDetails[user._id || user.id] || ''}
                          onChange={(e) => handleSplitDetailChange(user._id || user.id, e.target.value)}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 1.75rem', borderRadius: '8px', border: '1px solid #eee', outline: 'none', textAlign: 'right' }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700 }}>
              <CheckCircle size={20} /> Save Expense
            </button>
          </form>
      </div>
    </div>
  );
};

