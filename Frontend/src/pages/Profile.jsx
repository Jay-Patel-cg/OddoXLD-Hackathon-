import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="main-wrapper" style={{ maxWidth: '720px' }}>
      <div style={{ textAlign: 'center', margin: '32px 0 40px 0' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>User Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal travel preferences and account details</p>
      </div>

      <div className="wizard-card" style={{ maxWidth: '100%', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--accent-sand)',
              border: '3px solid var(--accent-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '800',
              color: 'var(--accent-terracotta)',
              overflow: 'hidden'
            }}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name ? user.name[0].toUpperCase() : 'M'
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>{user?.name || 'Musafir Traveler'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--bg-warm)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Account Status</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--status-success)', marginTop: '4px' }}>Active Member</div>
          </div>
          <div style={{ background: 'var(--bg-warm)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Member Since</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}
            </div>
          </div>
        </div>

        <div style={{ borderTop: 'var(--border-light)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn-ghost"
            style={{ color: 'var(--status-error)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={18} />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
