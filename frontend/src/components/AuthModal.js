import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { X, Mail, Lock, User, Wallet } from 'lucide-react';

const AuthModal = ({ onClose }) => {
  const { login, connectWallet, API } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    display_name: ''
  });

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        const response = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        login(response.data.token, response.data.user);
        toast.success('Signed in successfully!');
        onClose();
      } else {
        const response = await axios.post(`${API}/auth/register`, formData);
        login(response.data.token, response.data.user);
        toast.success('Account created successfully!');
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  const handleWalletAuth = async () => {
    try {
      await connectWallet();
      onClose();
    } catch (error) {
      toast.error('Wallet connection failed');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }} onClick={onClose} data-testid="auth-modal-overlay">
      <div className="glass-card" style={{
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()} data-testid="auth-modal">
        <button 
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={onClose}
          data-testid="close-auth-modal"
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '32px', marginBottom: '24px', textAlign: 'center' }} data-testid="auth-modal-title">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>

        {/* Wallet Auth */}
        <button 
          className="btn-wallet" 
          style={{ width: '100%', justifyContent: 'center', marginBottom: '24px' }}
          onClick={handleWalletAuth}
          data-testid="wallet-auth-btn"
        >
          <Wallet size={20} /> Sign In with Wallet
        </button>

        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          margin: '24px 0',
          position: 'relative'
        }}>
          <span style={{ background: '#1a1a2e', padding: '0 16px', position: 'relative', zIndex: 1 }}>OR</span>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)'
          }} />
        </div>

        {/* Email Auth */}
        <form onSubmit={handleEmailAuth}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="text"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={{ width: '100%', paddingLeft: '40px' }}
                    required
                    data-testid="username-input"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Display Name</label>
                <input
                  type="text"
                  placeholder="Your Display Name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  style={{ width: '100%' }}
                  required
                  data-testid="display-name-input"
                />
              </div>
            </>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', paddingLeft: '40px' }}
                required
                data-testid="email-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', paddingLeft: '40px' }}
                required
                data-testid="password-input"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} data-testid="submit-auth-btn">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#667eea', 
              marginLeft: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            data-testid="toggle-auth-mode"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
