import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Sparkles, TrendingUp, Users as UsersIcon, Play } from 'lucide-react';

const HomePage = () => {
  const { user, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetchFeed();
    fetchTopCreators();
    fetchSubscriptions();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API}/content/feed?limit=12`);
      setFeed(response.data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    }
  };

  const fetchTopCreators = async () => {
    try {
      const response = await axios.get(`${API}/discover/creators?limit=6`);
      setTopCreators(response.data);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  return (
    <div data-testid="home-page" style={{ paddingTop: '80px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 0' }}>
        {/* Hero Welcome */}
        <div style={{ padding: '0 40px', marginBottom: '60px' }} className="fade-in-up">
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px'
          }} data-testid="home-welcome">
            Welcome back, {user?.display_name}!
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '300' }} data-testid="home-subtitle">
            Discover amazing content and support your favorite creators
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="content-row fade-in">
          <div style={{ 
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            paddingBottom: '10px'
          }}>
            <div className="glass-card" style={{ padding: '24px', minWidth: '200px' }} data-testid="stat-subscriptions">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <UsersIcon size={24} style={{ color: '#a78bfa' }} />
                <h3 style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '300' }}>Subscriptions</h3>
              </div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#a78bfa' }}>{subscriptions.length}</p>
            </div>

            <div className="glass-card" style={{ padding: '24px', minWidth: '200px' }} data-testid="stat-profile">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Sparkles size={24} style={{ color: '#8b5cf6' }} />
                <h3 style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '300' }}>Your Profile</h3>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '12px', padding: '10px 24px', fontSize: '14px' }}
                onClick={() => navigate('/profile')}
                data-testid="view-profile-btn"
              >
                View Profile
              </button>
            </div>

            <div className="glass-card" style={{ padding: '24px', minWidth: '200px' }} data-testid="stat-explore">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <TrendingUp size={24} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '300' }}>Discover</h3>
              </div>
              <button 
                className="btn-secondary" 
                style={{ marginTop: '12px', padding: '10px 24px', fontSize: '14px' }}
                onClick={() => navigate('/explore')}
                data-testid="explore-more-btn"
              >
                Explore More
              </button>
            </div>
          </div>
        </div>

        {/* Trending Creators Row */}
        <div className="content-row fade-in" data-testid="trending-creators-row">
          <h2 className="row-title">Trending Creators</h2>
          <div className="row-container">
            {topCreators.slice(0, 10).map((creator) => (
              <div
                key={creator.id}
                className="creator-card"
                onClick={() => navigate(`/${creator.username}`)}
                data-testid={`top-creator-${creator.username}`}
              >
                <div 
                  className="creator-avatar"
                  style={{
                    background: creator.profile_image 
                      ? `url(${creator.profile_image})` 
                      : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} 
                />
                <h3 className="creator-name">{creator.display_name}</h3>
                <p className="creator-username">@{creator.username}</p>
                <div className="creator-stats">
                  <div className="stat-item">
                    <div className="stat-value">{creator.subscriber_count || 0}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">${creator.total_tips_received?.toFixed(0) || 0}</div>
                    <div className="stat-label">Earned</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Content Row */}
        <div className="content-row fade-in" data-testid="latest-content-row">
          <h2 className="row-title">New Drops</h2>
          <div className="row-container">
            {feed.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="content-item"
                onClick={() => navigate(`/${item.username}`)}
                data-testid={`feed-item-${item.id}`}
              >
                <div className="content-thumbnail">
                  {item.media_type === 'image' ? (
                    <img src={item.media_url} alt={item.title} />
                  ) : (
                    <video src={item.media_url} />
                  )}
                  <div className="content-overlay">
                    <Play size={48} style={{ color: 'white', opacity: 0.9 }} />
                  </div>
                </div>
                <div className="content-info">
                  <h3 className="content-title">{item.title}</h3>
                  <p className="content-creator">@{item.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {feed.length === 0 && topCreators.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255, 255, 255, 0.5)' }} data-testid="no-feed">
            <Sparkles size={64} style={{ margin: '0 auto 24px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', fontWeight: '300' }}>No content yet. Explore creators and start following them!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
