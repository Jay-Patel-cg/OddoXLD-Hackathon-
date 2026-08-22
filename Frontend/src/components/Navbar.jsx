import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Compass, User, LogOut, Sparkles, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <div className="floating-navbar-container">
      <nav className="floating-navbar">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-logo">
            <Compass size={18} />
          </div>
          <span>MUSAFIR</span>
        </Link>

        {/* Primary Navigation Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/explore" className={`nav-item ${isActive('/explore') ? 'active' : ''}`}>
            Explore
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/trips" className={`nav-item ${isActive('/trips') || isActive('/my-trips') ? 'active' : ''}`}>
                My Trips
              </Link>
              <Link to="/budget" className={`nav-item ${isActive('/budget') ? 'active' : ''}`}>
                Budget
              </Link>
            </>
          )}
          <Link to="/plan" className={`nav-item ${isActive('/plan') || isActive('/ai-planner') ? 'active' : ''}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="var(--accent-emerald)" />
              <span>AI Planner</span>
            </span>
          </Link>
        </div>

        {/* Right Side: Theme Toggle & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--accent-sand)',
              border: '1px solid var(--accent-emerald)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--accent-emerald)',
              transition: 'all 0.2s ease'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || 'User'}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-emerald)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--accent-sand)',
                      color: 'var(--accent-emerald)',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '200px',
                    background: 'var(--surface-card)',
                    border: 'var(--border-light)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '8px',
                    zIndex: 999
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: 'var(--border-light)', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.name || 'Traveler'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email || ''}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      fontWeight: '600'
                    }}
                  >
                    <User size={15} />
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.88rem',
                      color: 'var(--status-error)',
                      fontWeight: '600',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
