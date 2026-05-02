import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import { User as UserIcon, Settings, Moon, Sun, LogOut, ChevronRight, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchExpenses, fetchGroups } from '../api/apiClient';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState({ totalSpent: 0, activeGroups: 0 });
  const [loading, setLoading] = useState(true);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  
  const userProfile = JSON.parse(localStorage.getItem('profile') || '{}');
  const currentUser = userProfile?.result;

  useEffect(() => {
    // Check initial theme
    const theme = document.documentElement.getAttribute('data-theme');
    setIsDarkMode(theme === 'dark');

    const getStats = async () => {
      try {
        const { data: expData } = await fetchExpenses();
        const { data: groupData } = await fetchGroups();
        
        const myId = (currentUser?._id || currentUser?.id)?.toString();
        const myExpenses = expData.filter((e: any) => {
          const payerId = (e.paidBy?._id || e.paidBy)?.toString();
          return payerId === myId;
        });
        const total = myExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

        setStats({
          totalSpent: total,
          activeGroups: groupData.length
        });
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      getStats();
    }
  }, [currentUser]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      setIsDarkMode(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('profile');
    navigate('/auth');
  };

  if (!currentUser) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Please login to view profile</div>;
  }

  return (
    <div className={styles.container}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '1rem' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', 
          backgroundColor: 'var(--color-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 'bold'
        }}>
          {currentUser.name.charAt(0)}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currentUser.name}</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>{currentUser.email}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1.5rem 1rem' }}>
          <CreditCard size={24} style={{ color: 'var(--color-primary)', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{stats.totalSpent.toLocaleString()}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Spent</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: '1.5rem 1rem' }}>
          <Users size={24} style={{ color: 'var(--color-secondary)', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.activeGroups}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Groups</p>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="card" style={{ padding: '0.5rem 1.5rem' }}>
        {/* Account Details - expandable */}
        <div>
          <div 
            onClick={() => setShowAccountDetails(prev => !prev)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: showAccountDetails ? 'none' : '1px solid var(--color-border)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <UserIcon size={20} />
              </div>
              <span style={{ fontWeight: 500 }}>Account Details</span>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--color-text-muted)', transform: showAccountDetails ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
          {showAccountDetails && (
            <div style={{ padding: '1rem', background: 'var(--color-background)', borderRadius: '12px', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Full Name</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Email</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Member ID</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#{(currentUser._id || currentUser.id || '').slice(-8).toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <span style={{ fontWeight: 500 }}>Dark Mode</span>
          </div>
          <div 
            onClick={toggleDarkMode}
            style={{ 
              width: '44px', height: '24px', backgroundColor: isDarkMode ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            <div style={{ 
              width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
              position: 'absolute', top: '2px', left: isDarkMode ? '22px' : '2px', transition: 'all 0.3s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>

        <div 
          onClick={() => navigate('/settings')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <Settings size={20} />
            </div>
            <span style={{ fontWeight: 500 }}>Preferences</span>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', cursor: 'pointer' }}
          onClick={handleLogout}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-danger)' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
              <LogOut size={20} />
            </div>
            <span style={{ fontWeight: 500 }}>Log Out</span>
          </div>
        </div>
      </div>

    </div>
  );
};
