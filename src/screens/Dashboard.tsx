import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, Activity, User as UserIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchExpenses, fetchGroupDetails, deleteExpense as apiDeleteExpense, fetchUsers } from '../api/apiClient';
import { calculateNetBalances, calculateSettlements, getUserSummary } from '../utils/balances';
import styles from './Dashboard.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupId = queryParams.get('group');

  const [expenses, setExpenses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const userProfile = JSON.parse(localStorage.getItem('profile') || '{}');
  const currentUser = userProfile?.result?.id || userProfile?.result?._id;
  const [currency, setCurrency] = useState('₹');
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      const { currency: savedCurrency } = JSON.parse(saved);
      setCurrency(savedCurrency || '₹');
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        let expenseData;
        let userData;

        if (groupId) {
          const { data: groupData } = await fetchGroupDetails(groupId);
          setGroup(groupData);
          userData = groupData.members;
          const { data: allExpenses } = await fetchExpenses();
          expenseData = allExpenses.filter((e: any) => {
            const eGroupId = e.groupId?._id || e.groupId;
            return eGroupId?.toString() === groupId;
          });
        } else {
          const { data: allExpenses } = await fetchExpenses();
          expenseData = allExpenses;
          const { data: allUsers } = await fetchUsers();
          userData = allUsers;
          setGroup(null);
        }
        
        const normalizedUsers = userData.map((u: any) => ({ ...u, id: u._id || u.id }));
        const normalizedExpenses = expenseData.map((e: any) => ({ 
          ...e, 
          id: e._id,
          paidBy: typeof e.paidBy === 'object' ? (e.paidBy._id || e.paidBy.id) : e.paidBy,
          splitAmong: e.splitAmong.map((s: any) => {
            if (typeof s === 'object' && s.user) {
              return {
                user: typeof s.user === 'object' ? (s.user._id || s.user.id) : s.user,
                amount: s.amount
              };
            }
            return s;
          })
        }));

        const sortedExpenses = normalizedExpenses.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setExpenses(sortedExpenses);
        setUsers(normalizedUsers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [groupId]);

  const { totalExpense, myOwe, myGetBack, settlements, highestCategory } = useMemo(() => {
    const netBalances = calculateNetBalances(expenses, users.length > 0 ? users : [{ id: currentUser }]);
    const currentSettlements = calculateSettlements(netBalances);
    const { youOwe, youGetBack } = getUserSummary(currentUser, currentSettlements);
    
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const categories = expenses.reduce((acc: any, exp) => {
      const cat = exp.category || 'Other';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});
    
    let highest = 'None';
    let maxAmount = -1;
    
    Object.entries(categories).forEach(([cat, amount]: any) => {
      if (amount > 0 && amount > maxAmount) {
        maxAmount = amount;
        highest = cat;
      }
    });

    return { 
      totalExpense: total, 
      myOwe: youOwe, 
      myGetBack: youGetBack, 
      settlements: currentSettlements,
      highestCategory: highest
    };
  }, [expenses, users, currentUser]);

  const handleDeleteExpense = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this expense?')) {
      try {
        await apiDeleteExpense(id);
        setExpenses(expenses.filter(exp => (exp._id || exp.id) !== id));
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
  };

  const getUserName = (id: string) => {
    const u = users.find(user => (user.id || user._id) === id);
    return u ? u.name : 'Unknown';
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expenses;
    return expenses.filter(exp => 
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  if (loading) return <div className={styles.loadingContainer}><Activity className="shimmer" /><h3>Loading Dashboard...</h3></div>;

  return (
    <div className={styles.dashboardContainer}>
      <motion.div className={styles.topHeader} variants={itemVariants} initial="hidden" animate="visible">
        <div className={styles.searchBar}>
          <Search size={18} color="#888" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.userActions}>
          <button className={styles.iconBtn} onClick={() => navigate('/profile')} title="Profile"><UserIcon size={18} /></button>
          <button className={styles.iconBtn} onClick={() => alert('No new notifications')} title="Notifications"><Bell size={18} /></button>
          <button className={styles.iconBtn} onClick={() => navigate('/settings')} title="Settings"><Settings size={18} /></button>
        </div>
      </motion.div>

      <motion.div className={styles.greetingSection} variants={itemVariants} initial="hidden" animate="visible">
        <h1>{group ? group.name : `Good morning, ${userProfile?.result?.name || 'User'}`}</h1>
        <p>
          {group 
            ? `Viewing activity for ${group.name}. ${expenses.length} expenses recorded.` 
            : `You have a total of ${currency}${totalExpense} group expenses. Stay on top of your settlements today.`
          }
        </p>
      </motion.div>

      <motion.div className={styles.mainGrid} variants={containerVariants} initial="hidden" animate="visible">
        <div className={styles.contentColumn}>
          <div className={styles.cardsGrid}>
            <motion.div className={`${styles.pastelCard} ${styles.yellowCard}`} variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <h3>Expenses:</h3>
              <div className={styles.cardStats}>
                <div>
                  <p className={styles.statLarge}>{currency}{totalExpense}</p>
                  <p className={styles.statSmall}>Total Group</p>
                </div>
              </div>
              <div className={styles.mockChartYellow}></div>
            </motion.div>

            <motion.div className={`${styles.pastelCard} ${styles.pinkCard}`} variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <h3>Settlements summary:</h3>
              <div className={styles.cardStats}>
                <div>
                  <p className={styles.statLarge}>{currency}{myGetBack}</p>
                  <p className={styles.statSmall}>You Get Back</p>
                </div>
                <div>
                  <p className={styles.statLarge}>{currency}{myOwe}</p>
                  <p className={styles.statSmall}>You Owe</p>
                </div>
              </div>
              <div className={styles.mockChartPink}></div>
            </motion.div>

            <motion.div className={`${styles.pastelCard} ${styles.greenCard}`} variants={itemVariants} whileHover={{ scale: 1.02 }}>
              <h3>By category:</h3>
              <div className={styles.cardStats}>
                <div>
                  <p className={styles.statLarge}>{highestCategory}</p>
                  <p className={styles.statSmall}>Highest</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className={styles.listsContainer}>
            <motion.div className={styles.listColumn} variants={itemVariants}>
              <div className={styles.listHeader}>
                <h3>Recent Expenses</h3>
                <button className={styles.dropdownBtn}>All Time</button>
              </div>
              <div className={styles.pillList}>
                {filteredExpenses.map((exp, i) => (
                  <motion.div 
                    key={exp._id || exp.id} 
                    className={`${styles.pillItem} ${i % 3 === 0 ? styles.pillPink : i % 3 === 1 ? styles.pillBlue : styles.pillGreen}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={styles.pillIcon}><Activity size={18} /></div>
                    <div className={styles.pillContent}>
                      <h4>{exp.title}</h4>
                      <p>{exp.category}</p>
                    </div>
                    <div className={styles.pillRight} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={styles.pillTime}>{currency}{exp.amount}</span>
                      <button 
                        onClick={(e) => handleDeleteExpense(e, exp._id || exp.id)}
                        style={{ color: 'var(--color-danger)', opacity: 0.5, padding: '0.25rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className={styles.listColumn} variants={itemVariants}>
              <div className={styles.listHeader}>
                <h3>Settlements</h3>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                {settlements.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '2rem' }}>All settled up! 🎉</p>
                ) : (
                  settlements.slice(0, 5).map((s, i) => (
                    <div key={i} className={styles.detailRow}>
                      <div className={styles.detailTitle}>{getUserName(s.from)}</div>
                      <div className={styles.detailValue}>pays {getUserName(s.to)} {currency}{s.amount}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.calendarWidget}>
            <div className={styles.calendarHeader}>
              <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>←</button>
              <div className={styles.calendarMonth}>
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarDate)}
              </div>
              <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>→</button>
            </div>
            <div className={styles.calendarGrid}>
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className={styles.calDayHeader}>{d}</div>)}
              {/* blank cells to align first day */}
              {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {/* actual days */}
              {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                const day = i + 1;
                const today = new Date();
                const isToday = day === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear();
                const hasExpense = expenses.some(e => {
                  const d = new Date(e.date);
                  return d.getDate() === day && d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear();
                });
                return (
                  <div key={day} className={`${styles.calDay} ${isToday ? styles.calActive : ''}`} style={{ position: 'relative' }}>
                    {day}
                    {hasExpense && <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: isToday ? 'white' : 'var(--color-primary)' }} />}
                  </div>
                );
              })}
            </div>
            <button className={styles.btnDarkFull} onClick={() => navigate('/add-expense')}>
              Add New Expense
            </button>
          </div>

          <div className={styles.timelineWidget}>
            <h3>Group Members</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {users.map((u, i) => (
                <div key={u._id || u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i % 2 === 0 ? 'var(--card-pink)' : 'var(--card-blue)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{u.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{u.email || 'Member'}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>No members found</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
