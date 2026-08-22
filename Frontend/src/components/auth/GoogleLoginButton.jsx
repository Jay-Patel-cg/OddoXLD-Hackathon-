import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const GoogleLoginButton = ({ text = 'continue_with', onSuccessRedirect = '/' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isUnconfigured = !clientId || clientId.includes('mockclientid') || clientId.includes('your_google_client_id');

  const handleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      if (credentialResponse && credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate(onSuccessRedirect);
      } else {
        throw new Error('Google identity credential missing');
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google Sign-In configuration error or popup closed.');
  };

  if (isUnconfigured) {
    return (
      <div style={{ width: '100%', padding: '12px 16px', background: '#F8FBFD', border: 'var(--border-light)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-navy)', marginBottom: '4px' }}>
          <AlertCircle size={15} color="var(--accent-ocean)" />
          <span>Google Sign-In Setup Required</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>Frontend/.env</code> and <code>GOOGLE_CLIENT_ID</code> to <code>Backend/.env</code> to enable real Google OAuth login.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {error && (
        <div style={{ width: '100%', background: 'rgba(217, 56, 56, 0.1)', color: 'var(--status-error)', padding: '10px 14px', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', padding: '10px' }}>
          Authenticating with Google...
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            shape="pill"
            text={text}
            theme="outline"
            width="320px"
          />
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
