import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, PieChart, User, Users, Settings, LogOut, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/groups', icon: <Users size={20} />, label: 'Groups' },
    { path: '/analytics', icon: <PieChart size={20} />, label: 'Statistics & reports' },
  ];

  const toolsItems = [
    { path: '/add-expense', icon: <PlusCircle size={20} />, label: 'Add Expense' },
    { path: '/ai-insights', icon: <Sparkles size={20} />, label: 'AI Insights' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const sidebarVariants: any = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleLogout = () => {
    localStorage.removeItem('profile');
    window.location.href = '/auth';
  };

  return (
    <motion.div 
      className={styles.sidebar}
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className={styles.logoContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} style={{ color: '#EC4899' }} />
          <h1 className={styles.logoText} style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>SmartSplit</h1>
        </div>
        <button className={styles.collapseBtn}>
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className={styles.navSection}>
        <p className={styles.sectionTitle}>General</p>
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <motion.div key={item.path} variants={itemVariants}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.navSection}>
        <p className={styles.sectionTitle}>Tools</p>
        <div className={styles.navLinks}>
          {toolsItems.map((item) => (
            <motion.div key={item.path} variants={itemVariants}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={styles.logoutSection}>
        <button className={styles.navItem} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </motion.div>
  );
};
