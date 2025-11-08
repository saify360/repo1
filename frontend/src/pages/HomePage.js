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
    <div data-testid="home-page">
      <Navbar />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '12px' }} data-testid="home-welcome">
            Welcome back, {user?.display_name}!
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)' }} data-testid="home-subtitle">
            Discover amazing content and support your favorite creators
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px',
          marginBottom: '48px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }} data-testid="stat-subscriptions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <UsersIcon size={24} style={{ color: '#667eea' }} />
              <h3 style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>Subscriptions</h3>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700' }}>{subscriptions.length}</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }} data-testid="stat-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Sparkles size={24} style={{ color: '#43e97b' }} />
              <h3 style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>Your Profile</h3>
            </div>
            <button 
              className="btn-primary" 
              style={{ marginTop: '12px', padding: '8px 16px', fontSize: '14px' }}
              onClick={() => navigate('/profile')}
              data-testid="view-profile-btn"
            >
              View Profile
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px' }} data-testid="stat-explore">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={24} style={{ color: '#f5576c' }} />
              <h3 style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>Discover</h3>
            </div>
            <button 
              className="btn-secondary" 
              style={{ marginTop: '12px', padding: '8px 16px', fontSize: '14px' }}
              onClick={() => navigate('/explore')}
              data-testid="explore-more-btn"
            >
              Explore More
            </button>
          </div>
        </div>

        {/* Top Creators */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }} data-testid="top-creators-heading">
            Top Creators
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '24px' 
          }}>
            {topCreators.slice(0, 6).map((creator) => (
              <div
                key={creator.id}
                className="glass-card"
                style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => navigate(`/${creator.username}`)}
                data-testid={`top-creator-${creator.username}`}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: creator.profile_image 
                    ? `url(${creator.profile_image})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto 16px',
                  border: '3px solid rgba(255, 255, 255, 0.1)'
                }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  {creator.display_name}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
                  @{creator.username}
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {creator.subscriber_count || 0} subscribers
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Content */}
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }} data-testid="latest-content-heading">
            Latest Content
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            {feed.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate(`/${item.username}`)}
                data-testid={`feed-item-${item.id}`}
              >
                {item.media_type === 'image' ? (
                  <img 
                    src={item.media_url} 
                    alt={item.title} 
                    style={{ 
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '16px 16px 0 0'
                    }} 
                  />
                ) : (
                  <video 
                    src={item.media_url} 
                    style={{ 
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '16px 16px 0 0'
                    }} 
                  />
                )}
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>@{item.username}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>{item.title}</h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {feed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.6)' }} data-testid="no-feed">
              <p>No content yet. Explore creators and start following them!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
