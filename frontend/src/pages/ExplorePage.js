import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const ExplorePage = () => {
  const { API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [feed, setFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('creators');

  useEffect(() => {
    fetchCreators();
    fetchFeed();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await axios.get(`${API}/discover/creators?limit=30`);
      setCreators(response.data);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
    }
  };

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API}/content/feed?limit=30`);
      setFeed(response.data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    }
  };

  return (
    <div data-testid="explore-page">
      <Navbar />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }} data-testid="explore-title">
          Discover Amazing Creators
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', justifyContent: 'center' }}>
          <button
            className={activeTab === 'creators' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('creators')}
            data-testid="creators-tab"
          >
            Creators
          </button>
          <button
            className={activeTab === 'content' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('content')}
            data-testid="content-tab"
          >
            Content Feed
          </button>
        </div>

        {/* Creators Grid */}
        {activeTab === 'creators' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }} data-testid="creators-grid">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="profile-card"
                onClick={() => navigate(`/${creator.username}`)}
                data-testid={`creator-card-${creator.username}`}
              >
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: creator.profile_image 
                    ? `url(${creator.profile_image})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto 16px',
                  border: '3px solid rgba(255, 255, 255, 0.1)'
                }} data-testid="creator-avatar" />
                
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px', textAlign: 'center' }} data-testid="creator-name">
                  {creator.display_name}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }} data-testid="creator-username">
                  @{creator.username}
                </p>
                
                {creator.bio && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    marginBottom: '16px',
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }} data-testid="creator-bio">
                    {creator.bio}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ textAlign: 'center' }} data-testid="creator-subscribers">
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{creator.subscriber_count || 0}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Subscribers</div>
                  </div>
                  <div style={{ textAlign: 'center' }} data-testid="creator-tips">
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>${creator.total_tips_received?.toFixed(0) || 0}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Tips</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Feed */}
        {activeTab === 'content' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }} data-testid="content-feed">
            {feed.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate(`/${item.username}`)}
                data-testid={`feed-item-${item.id}`}
              >
                {item.media_type === 'image' ? (
                  <img src={item.media_url} alt={item.title} className="content-media" style={{ margin: 0, borderRadius: '16px 16px 0 0', height: '250px' }} data-testid="feed-image" />
                ) : (
                  <video src={item.media_url} controls className="content-media" style={{ margin: 0, borderRadius: '16px 16px 0 0', height: '250px' }} data-testid="feed-video" />
                )}
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }} data-testid="feed-creator-avatar" />
                    <span style={{ fontWeight: '600' }} data-testid="feed-creator-username">@{item.username}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }} data-testid="feed-title">{item.title}</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }} data-testid="feed-description">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {creators.length === 0 && activeTab === 'creators' && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.6)' }} data-testid="no-creators">
            <Users size={64} style={{ margin: '0 auto 24px', opacity: 0.5 }} />
            <p>No creators yet. Be the first to join!</p>
          </div>
        )}

        {feed.length === 0 && activeTab === 'content' && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.6)' }} data-testid="no-feed">
            <p>No content available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
