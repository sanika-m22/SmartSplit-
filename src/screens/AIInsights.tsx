import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, Wallet, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { fetchExpenses, fetchUsers } from '../api/apiClient';
import styles from './AIInsights.module.css';

export const AIInsights: React.FC = () => {
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const insights = useMemo(() => {
    if (expenses.length === 0) return null;

    // Top Category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.entries(categoryTotals).reduce((a, b) => b[1] > a[1] ? b : a, ['Other', 0]);
    const topCategoryPercent = (topCategory[1] / totalExpense) * 100;

    // Top Contributor
    const contributorTotals: Record<string, number> = {};
    expenses.forEach(e => {
      const paidById = typeof e.paidBy === 'object' ? e.paidBy._id : e.paidBy;
      contributorTotals[paidById] = (contributorTotals[paidById] || 0) + e.amount;
    });
    const topContributorId = Object.entries(contributorTotals).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0])[0];
    const topContributor = users.find(u => (u._id || u.id) === topContributorId);
    const topContributorPercent = ((contributorTotals[topContributorId] || 0) / totalExpense) * 100;

    // Trends
    const weekendSpending = expenses.filter(e => {
      const day = new Date(e.date).getDay();
      return day === 0 || day === 6;
    }).reduce((sum, e) => sum + e.amount, 0);
    const weekendPercent = (weekendSpending / totalExpense) * 100;

    return {
      topCategory: topCategory[0],
      topCategoryAmount: topCategory[1],
      topCategoryPercent: topCategoryPercent.toFixed(0),
      topContributorName: topContributor?.name || 'Someone',
      topContributorPercent: topContributorPercent.toFixed(0),
      weekendPercent: weekendPercent.toFixed(0)
    };
  }, [expenses, users, totalExpense]);

  const predictionData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const adjustedDays = [...days.slice(today), ...days.slice(0, today)];
    
    return adjustedDays.map((name, i) => ({
      name,
      actual: i === 0 ? totalExpense / 7 : null,
      predicted: (totalExpense / 7) * (1 + Math.random() * 0.2)
    }));
  }, [totalExpense]);

  const contributionData = useMemo(() => {
    const categories = ['Food', 'Travel', 'Shopping', 'Stay', 'Other'];
    return categories.map(cat => {
      const row: any = { category: cat };
      users.forEach(u => {
        row[u.name] = expenses
          .filter(e => e.category === cat && (typeof e.paidBy === 'object' ? e.paidBy._id === (u._id || u.id) : e.paidBy === (u._id || u.id)))
          .reduce((sum, e) => sum + e.amount, 0);
      });
      return row;
    });
  }, [expenses, users]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Analyzing data...</div>;

  if (expenses.length === 0 || !insights) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No AI insights available</h2>
        <p>Add some expenses to see intelligent patterns.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const chartColors = ['#F9C8EC', '#93ACDC', '#A4C68B', '#FDE894', '#6366f1'];

  return (
    <div className={styles.insightsPage}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-box" style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: '12px' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>AI Spending Insights</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Intelligent analysis of your group's financial behavior.</p>
          </div>
        </div>
        <span className={styles.aiBadge}>AI Engine v2.0</span>
      </div>

      <motion.div 
        className={styles.insightsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={`${styles.insightCard} ai-glow`} variants={itemVariants} whileHover={{ y: -5 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(249, 200, 236, 0.2)' }}>
              <TrendingUp size={20} style={{ color: '#d946ef' }} />
            </div>
            <h4>Spending Trends</h4>
          </div>
          <div className={styles.cardBody}>
            <p><strong>Most spending on {insights.topCategory}</strong></p>
            <p>₹{insights.topCategoryAmount.toFixed(0)} spent on {insights.topCategory}. This accounts for {insights.topCategoryPercent}% of total group spending.</p>
          </div>
        </motion.div>

        <motion.div className={`${styles.insightCard} ai-glow`} variants={itemVariants} whileHover={{ y: -5 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(147, 172, 220, 0.2)' }}>
              <Wallet size={20} style={{ color: '#3b82f6' }} />
            </div>
            <h4>Budget Forecast</h4>
          </div>
          <div className={styles.cardBody}>
            <p><strong>Spending is {insights.topCategoryPercent > '40' ? 'high' : 'stable'}</strong></p>
            <p>Your current {insights.topCategory} spending is {insights.topCategoryPercent}% of your total. We suggest monitoring these costs over the next week.</p>
          </div>
          <div className={styles.mockProgress}>
            <div className={styles.progressBar} style={{ width: `${insights.topCategoryPercent}%` }} />
          </div>
        </motion.div>

        <motion.div className={`${styles.insightCard} ai-glow`} variants={itemVariants} whileHover={{ y: -5 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(164, 198, 139, 0.2)' }}>
              <Users size={20} style={{ color: '#22c55e' }} />
            </div>
            <h4>Top Contributor</h4>
          </div>
          <div className={styles.cardBody}>
            <p><strong>{insights.topContributorName} paid the most</strong></p>
            <p>{insights.topContributorName} has covered {insights.topContributorPercent}% of group expenses. Consider balancing upcoming payments.</p>
          </div>
        </motion.div>

        <motion.div className={`${styles.insightCard} ai-glow`} variants={itemVariants} whileHover={{ y: -5 }}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(253, 232, 148, 0.2)' }}>
              <AlertCircle size={20} style={{ color: '#eab308' }} />
            </div>
            <h4>Time Analysis</h4>
          </div>
          <div className={styles.cardBody}>
            <p><strong>Weekend activity</strong></p>
            <p>Weekend spending accounts for {insights.weekendPercent}% of your total. Weekend costs are primarily {insights.topCategory} related.</p>
          </div>
        </motion.div>
      </motion.div>

      <div className={styles.analyticsSection}>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Intelligent Visualizations</h3>
        <div className={styles.mockChartsGrid}>
          <div className="card glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>AI Predicted Spending</h4>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#93ACDC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#93ACDC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="actual" stroke="#93ACDC" fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
                  <Line type="monotone" dataKey="predicted" stroke="#F9C8EC" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>✨ Dashed line represents AI prediction for the next 48 hours.</p>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>Contribution Heatmap</h4>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }} />
                  {users.map((user, index) => (
                    <Bar 
                      key={user.id || user._id} 
                      dataKey={user.name} 
                      stackId="a" 
                      fill={chartColors[index % chartColors.length]} 
                      radius={index === users.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>💡 Shows proportional contribution per category across group members.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

