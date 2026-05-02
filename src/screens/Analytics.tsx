import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchExpenses } from '../api/apiClient';
import styles from './Analytics.module.css';

export const Analytics: React.FC = () => {
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // Aggregate expenses by category
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find((item: any) => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#F9C8EC', '#93ACDC', '#A4C68B', '#FDE894', '#E5E7EB'];

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading analytics...</div>;

  if (expenses.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No analytics data available</h2>
        <p>Start adding expenses to see your spending breakdown.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>Financial Analytics</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Intelligent breakdown of your spending habits powered by SmartSplit AI</p>
      </div>

      <div className={`${styles.chartCard} card glass-panel`}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Spending by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {categoryData.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `₹${value}`}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Intelligent Insights</h3>
        <div className={styles.insightsGrid}>
          
          <div className="card ai-glow" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(249, 200, 236, 0.2)', borderRadius: '14px', color: '#d946ef' }}>
              <Lightbulb size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Top Category</h4>
                <span style={{ fontSize: '0.65rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>AI Insight</span>
              </div>
              {categoryData.length > 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Most of your spending (₹{Math.max(...categoryData.map((c: any) => c.value))}) went towards <strong>{categoryData.sort((a: any, b: any) => b.value - a.value)[0].name}</strong>.</p>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No spending data available yet.</p>
              )}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(147, 172, 220, 0.2)', borderRadius: '14px', color: '#3b82f6' }}>
              <TrendingUp size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Total Spent</h4>
                <span style={{ fontSize: '0.65rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>Summary</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>You've spent a total of ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0)} across {expenses.length} transactions.</p>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(164, 198, 139, 0.2)', borderRadius: '14px', color: '#22c55e' }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Budget Status</h4>
                <span style={{ fontSize: '0.65rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>AI Prediction</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Your current daily average is ₹{(expenses.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, expenses.length)).toFixed(0)}.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
