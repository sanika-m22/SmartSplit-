import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Groups.module.css';
import { fetchGroups, joinGroup } from '../api/apiClient';

export const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getGroups = async () => {
      try {
        const { data } = await fetchGroups();
        setGroups(data);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };
    getGroups();
  }, []);

  const handleJoinGroup = async () => {
    const code = prompt('Enter the 6-character invite code:');
    if (code) {
      try {
        const { data } = await joinGroup(code.toUpperCase());
        setGroups([...groups, data]);
        alert(`Successfully joined ${data.name}!`);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to join group');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading groups...</div>;

  return (
    <div className={styles.groupsContainer}>
      <div className={styles.header}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Groups</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your shared expenses with friends and family</p>
        </div>
        <div className={styles.actions}>
          <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }} onClick={handleJoinGroup}>
            <UserPlus size={18} /> Join Group
          </button>
          <button className="btn-primary" style={{ padding: '0.75rem 1.5rem' }} onClick={() => navigate('/create-group')}>
            <Plus size={18} /> Create Group
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.emptyState}
        >
          <div className={styles.illustrationWrapper}>
            <div className={styles.circleBg}>
              <Users size={48} color="var(--color-primary)" />
            </div>
            <div className={styles.sparkle1}><Sparkles size={16} /></div>
            <div className={styles.sparkle2}><Sparkles size={20} /></div>
          </div>
          <h3>No groups found</h3>
          <p>You haven't joined any groups yet. Create one or ask your friends for an invite code.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={() => navigate('/create-group')}>
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <motion.div 
              key={group._id} 
              className={styles.groupCard}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/dashboard?group=${group._id}`)}
            >
              <div className={styles.groupIcon}>
                {group.name.charAt(0)}
              </div>
              <div className={styles.groupInfo}>
                <h3>{group.name}</h3>
                <p>{group.members.length} members</p>
                <span className={styles.inviteCode}>Code: {group.inviteCode}</span>
              </div>
              <ArrowRight className={styles.arrow} size={20} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
