import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { Wallet, Users, Zap, Shield } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      
      <div className="hero-section" data-testid="hero-section">
        <h1 className="hero-title" data-testid="hero-title">Welcome to 3AM</h1>
        <p className="hero-subtitle" data-testid="hero-subtitle">
          The seamless Web3 creator platform. Build, fund, and monetize your ideas
          without the crypto complexity.
        </p>
        
        <div className="hero-buttons">
          {!user ? (
            <>
              <button 
                className="btn-primary" 
                onClick={() => setShowAuth(true)}
                data-testid="get-started-btn"
              >
                Get Started
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/explore')}
                data-testid="explore-btn"
              >
                Explore Creators
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/profile')}
                data-testid="my-profile-btn"
              >
                My Profile
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/explore')}
                data-testid="explore-creators-btn"
              >
                Explore
              </button>
            </>
          )}
        </div>

        {/* Features Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginTop: '100px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }} data-testid="feature-wallet">
            <Wallet size={48} style={{ color: '#667eea', marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Smart Wallet</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Unified fiat + crypto wallet with instant payouts in USDC
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }} data-testid="feature-monetize">
            <Zap size={48} style={{ color: '#43e97b', marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Instant Monetization</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Receive tips, mint NFTs, and earn from your content instantly
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }} data-testid="feature-creators">
            <Users size={48} style={{ color: '#fa709a', marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Creator First</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Built for creators. No coding or crypto knowledge required
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }} data-testid="feature-secure">
            <Shield size={48} style={{ color: '#f5576c', marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Secure & Verified</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Manual KYC verification ensures a professional community
            </p>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default HomePage;
