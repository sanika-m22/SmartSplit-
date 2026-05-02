import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { signIn, signUp } from '../api/apiClient';
import styles from './Auth.module.css';

const initialState = { name: '', email: '', password: '', confirmPassword: '' };

export const Auth: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const { data } = await signUp(formData);
        localStorage.setItem('profile', JSON.stringify(data));
      } else {
        const { data } = await signIn(formData);
        localStorage.setItem('profile', JSON.stringify(data));
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = () => {
    setIsSignup((prev) => !prev);
    setError('');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.backgroundGlow} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.authCard}
      >
        <div className={styles.authHeader}>
          <div className={styles.logoCircle}>
            <Sparkles size={32} color="white" />
          </div>
          <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignup ? 'Join SmartSplit and start splitting expenses' : 'Sign in to manage your group expenses'}</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {isSignup && (
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input 
                name="name" 
                placeholder="Full Name" 
                onChange={handleChange} 
                required 
              />
            </div>
          )}
          <div className={styles.inputGroup}>
            <Mail size={18} className={styles.inputIcon} />
            <input 
              name="email" 
              type="email" 
              placeholder="Email Address" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
          </div>
          {isSignup && (
            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm Password" 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className={styles.switchMode}>
          <button onClick={switchMode}>
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
