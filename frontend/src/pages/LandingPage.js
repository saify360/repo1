import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Shield, Zap } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  return (
    <div data-testid="landing-page">
      {/* Landing Navbar */}
      <nav className="navbar" data-testid="landing-navbar">
        <div className="navbar-container">
          <div className="navbar-logo" data-testid="landing-logo">
            3AM
          </div>
          
          <div className="navbar-menu">
            <a href="/explore" className="navbar-link" data-testid="landing-explore">Explore</a>
            <button className="btn-primary" onClick={() => setShowAuth(true)} data-testid="landing-signin">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section" data-testid="hero-section">
        <h1 className="hero-title" data-testid="hero-title" style={{ maxWidth: '1100px' }}>
          Create. Collaborate. Conquer.
        </h1>
        <p className="hero-subtitle" data-testid="hero-subtitle">
          Drop-kick valueless clickbait out of your feed and join a decentralized universe of creators actually getting paid for their work. Earn, monetize, and grow your story now.
        </p>
        
        <div className="hero-buttons">
          <button 
            className="btn-primary" 
            onClick={() => setShowAuth(true)}
            data-testid="get-started-btn"
            style={{ fontSize: '16px', padding: '14px 40px' }}
          >
            Get Started
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/explore')}
            data-testid="explore-btn"
            style={{ fontSize: '16px', padding: '14px 40px' }}
          >
            Explore Creators
          </button>
        </div>

        {/* Features Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginTop: '100px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          <div className="glass-card" style={{ padding: '32px' }} data-testid="feature-money">
            <DollarSign size={48} style={{ color: '#48bb78', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>We Don't Send Plaques, We Send Money</h3>
            <p style={{ color: 'inherit', opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>
              94%-6% creator-3AM split with free instant tipping, revenue splits, and payouts in USDC.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px' }} data-testid="feature-relationships">
            <Users size={48} style={{ color: '#5a67d8', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Relationships Your Best Friend Will Envy</h3>
            <p style={{ color: 'inherit', opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>
              Easily send and receive tips, create decentralized blockchain contracts for products, events, and partnerships via 3AM-Splits. Know exactly who you're supporting.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px' }} data-testid="feature-content">
            <Shield size={48} style={{ color: '#9f7aea', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Finely Tuned for Content That Matters</h3>
            <p style={{ color: 'inherit', opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>
              We cancel clickbait with KYC identity verification for creators with 100+ followers. Plus a sprinkle of 3AM AI to ensure content is backed by real people.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '32px' }} data-testid="feature-crypto">
            <Zap size={48} style={{ color: '#ed8936', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Take You to the Moon</h3>
            <p style={{ color: 'inherit', opacity: 0.7, fontSize: '14px', lineHeight: '1.6' }}>
              Smart wallet and blockchain integration for decentralized, secure access to your finances.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div style={{ marginTop: '120px', maxWidth: '1000px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '32px' }}>About 3AM</h2>
          
          <div className="glass-card" style={{ padding: '48px', textAlign: 'left' }}>
            <p style={{ fontSize: '16px', lineHeight: '1.8', opacity: 0.8, marginBottom: '24px' }}>
              3AM is a next-generation creator platform that unites social media, decentralized monetization, and blockchain technology into one seamless system. It's built to empower creators to earn instantly, collaborate freely, and fully own their digital presence — without needing any crypto knowledge or technical setup.
            </p>
            
            <p style={{ fontSize: '16px', lineHeight: '1.8', opacity: 0.8, marginBottom: '24px' }}>
              In a future where 90% of content may be AI-generated, we help creators and viewers maintain authority through a unified Smart Wallet. Receive instant payouts in both crypto and fiat currencies while engaging audiences through blockchain tipping, splits, and tokenized memberships. Every interaction becomes an opportunity to build sustainable income while maintaining total control of your data and audience.
            </p>
            
            <p style={{ fontSize: '16px', lineHeight: '1.8', opacity: 0.8, marginBottom: '24px' }}>
              AI tools built into the platform help analyze content performance, identify audience trends, and optimize engagement strategies — giving creators actionable insights to grow faster. Blockchain functionality operates entirely in the background, keeping the experience simple and familiar while maintaining transparency and security.
            </p>
            
            <p style={{ fontSize: '16px', lineHeight: '1.8', opacity: 0.8 }}>
              More than a platform, 3AM represents a creator-owned economy designed for transparency, empowerment, and collaboration. It bridges the gap between passion and profit, turning creative independence into real financial freedom.
            </p>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default LandingPage;
