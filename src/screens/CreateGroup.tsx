import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowRight, Sparkles, X } from 'lucide-react';


import { createGroup } from '../api/apiClient';
import styles from './CreateGroup.module.css';

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const userProfile = JSON.parse(localStorage.getItem('profile') || '{}');
  const currentUserName = userProfile?.result?.name || 'You';
  
  const [groupName, setGroupName] = useState('');
  const [tripType, setTripType] = useState('Friends Trip');
  const [description] = useState('');
  const [members, setMembers] = useState([{ name: `You (${currentUserName})` }, { name: '' }]);
  const [, setLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([...members, { name: '' }]);
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index].name = value;
    setMembers(newMembers);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGroup({ 
        name: groupName, 
        description: tripType + (description ? ': ' + description : '') 
      });
      navigate('/groups');
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-box" style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Create Group</h2>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--color-text-muted)' }}><X /></button>
      </div>

      <div className={styles.mainGrid}>
        {/* Left: Info Card */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(164, 198, 139, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Sparkles style={{ color: '#22c55e' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>AI Group Setup</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>SmartSplit AI will help organize settlements and categorize group expenses automatically.</p>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI Features enabled</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✅ Smart Category Matching</li>
              <li style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✅ Debt Minimization Engine</li>
              <li style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✅ Real-time Analytics</li>
            </ul>
          </div>
        </div>

        {/* Right: Form */}
        <form onSubmit={handleCreateGroup} className="card ai-glow" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Group Name</label>
            <input
              type="text"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
              placeholder="e.g. Europe Trip 2024"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Type</label>
            <select
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
            >
              <option>Friends Trip</option>
              <option>Family Trip</option>
              <option>Hostel Expenses</option>
              <option>Roommates</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Invite Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {members.map((member, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)', background: index === 0 ? 'var(--color-surface-hover)' : 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none', fontSize: '0.85rem' }}
                    placeholder="Name or Email"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    disabled={index === 0}
                    required={index > 0}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAddMember}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, background: 'white', border: '1px solid #eee' }}
            >
              <UserPlus size={16} /> Add Another Member
            </button>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700 }}>
            Launch Group <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
