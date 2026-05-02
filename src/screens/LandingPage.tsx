import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('profile');

  const handleAction = () => {
    if (isLoggedIn) {
      navigate('/groups');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className={styles.landingContainer}>
      <div className={styles.backgroundGlow} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={styles.heroContent}
      >
        <div className={styles.logoSection}>
          <Sparkles size={48} className={styles.logoIcon} />
          <h1 className={styles.appTitle}>SmartSplit</h1>
          <p className={styles.tagline}>Track. Split. Settle.</p>
        </div>

        <div className={styles.actionButtons}>
          <motion.button 
            whileHover={{ scale: 1.05, translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className={styles.primaryBtn}
            onClick={handleAction}
          >
            <Users size={24} />
            <span>Create Group</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className={styles.secondaryBtn}
            onClick={handleAction}
          >
            <UserPlus size={24} />
            <span>Join Group</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
