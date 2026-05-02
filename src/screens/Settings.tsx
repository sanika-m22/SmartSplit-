import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Trash2, Shield, Bell, Lock, Smartphone, Globe, ChevronRight } from 'lucide-react';
import { fetchGroups, deleteGroup, apiChangePassword } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      privacy: false,
      deviceSync: true,
      currency: '₹'
    };
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const { data } = await fetchGroups();
        setGroups(data);
      } catch (err) {
        console.error('Error fetching groups in settings:', err);
      } finally {
        setLoading(false);
      }
    };
    getGroups();
  }, []);

  const togglePref = (key: string) => {
    setPrefs((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceClick = (label: string) => {
    // This is now handled by togglePref for specific keys
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const confirmation = window.prompt(`Type "DELETE" to confirm deleting "${groupName}". This action is permanent.`);
    if (confirmation === 'DELETE') {
      try {
        await deleteGroup(groupId);
        setGroups(groups.filter(g => g._id !== groupId));
        alert('Group deleted successfully');
      } catch (err: any) {
        console.error('Error deleting group:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        alert(`Failed to delete group: ${errorMsg}`);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiChangePassword(passwordData);
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      alert(`Failed to change password: ${err.response?.data?.message || 'Error'}`);
    }
  };

  const handleLogoutOthers = () => {
    if (window.confirm('This will log you out from all current sessions. Continue?')) {
      localStorage.removeItem('profile');
      navigate('/auth');
    }
  };

  const settingsOptions = [
    { key: 'notifications', icon: <Bell size={20} />, label: 'Notifications', description: 'Manage group alerts and settlement reminders' },
    { key: 'privacy', icon: <Lock size={20} />, label: 'Privacy & Security', description: 'Control visibility and active sessions' },
    { key: 'deviceSync', icon: <Smartphone size={20} />, label: 'Device Management', description: 'Connected devices and sync settings' },
    { key: 'currency', icon: <Globe size={20} />, label: 'Language & Region', description: 'Currency (₹) and regional formats' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>App Settings</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Manage your account preferences and group configurations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Preferences</h3>
          <div className="card" style={{ padding: '0.5rem 1rem' }}>
            {settingsOptions.map((opt, i) => (
              <div 
                key={i} 
                onClick={() => opt.key !== 'currency' && togglePref(opt.key)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem 0', 
                  cursor: opt.key === 'currency' ? 'default' : 'pointer',
                  borderBottom: i === settingsOptions.length - 1 ? 'none' : '1px solid var(--color-border)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
                    {opt.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{opt.description}</p>
                  </div>
                </div>

                {opt.key === 'currency' ? (
                  <select 
                    value={prefs.currency} 
                    onChange={(e) => setPrefs((p: any) => ({ ...p, currency: e.target.value }))}
                    style={{ 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="₹">INR (₹)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                ) : opt.key === 'privacy' ? (
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                  >
                    Change Password
                  </button>
                ) : opt.key === 'deviceSync' ? (
                  <button 
                    onClick={handleLogoutOthers}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600, background: 'transparent' }}
                  >
                    Logout Others
                  </button>
                ) : (
                  <div style={{ 
                    width: '40px', 
                    height: '20px', 
                    backgroundColor: (prefs as any)[opt.key] ? '#10B981' : '#D1D5DB', 
                    borderRadius: '10px',
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: 'white', 
                      borderRadius: '50%', 
                      position: 'absolute', 
                      top: '2px', 
                      left: (prefs as any)[opt.key] ? '22px' : '2px',
                      transition: 'left 0.2s'
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Group Management</h3>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-danger)' }}>
              <Shield size={20} />
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Danger Zone</p>
            </div>

            {loading ? (
              <p style={{ fontSize: '0.85rem' }}>Loading groups...</p>
            ) : groups.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No groups to manage.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {groups.map(group => (
                  <div key={group._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{group.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{group.members.length} Members</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteGroup(group._id, group.name)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card" 
            style={{ width: '400px', padding: '2rem' }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-main)' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
