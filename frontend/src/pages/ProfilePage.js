import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, Edit, Settings } from 'lucide-react';
import Navbar from '../components/Navbar';
import ContentUpload from '../components/ContentUpload';

const ProfilePage = () => {
  const { user, token, API } = useContext(AuthContext);
  const [myContent, setMyContent] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [profile, setProfile] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    wallet_address: user?.wallet_address || ''
  });

  useEffect(() => {
    if (user) {
      fetchMyContent();
    }
  }, [user]);

  const fetchMyContent = async () => {
    try {
      const response = await axios.get(`${API}/content/user/${user.username}`);
      setMyContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axios.put(`${API}/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/profile/image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  return (
    <div data-testid="profile-page">
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Profile Header */}
        <div className="glass-card" style={{ padding: '40px', marginBottom: '32px' }} data-testid="profile-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
            {/* Profile Image */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: user?.profile_image 
                  ? `url(${user.profile_image})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '4px solid rgba(255, 255, 255, 0.1)'
              }} data-testid="profile-image" />
              <label 
                htmlFor="profile-image-upload" 
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: '#667eea',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid white'
                }}
                data-testid="upload-image-btn"
              >
                <Upload size={20} color="white" />
              </label>
              <input 
                id="profile-image-upload" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1 }}>
              {!isEditing ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '700' }} data-testid="profile-display-name">
                      {user?.display_name}
                    </h1>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '8px 16px' }}
                      onClick={() => setIsEditing(true)}
                      data-testid="edit-profile-btn"
                    >
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }} data-testid="profile-username">
                    @{user?.username}
                  </p>
                  <p style={{ marginBottom: '16px' }} data-testid="profile-bio">
                    {user?.bio || 'No bio yet. Click edit to add one!'}
                  </p>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                    <div data-testid="subscriber-count">
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>{user?.subscriber_count || 0}</div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Subscribers</div>
                    </div>
                    <div data-testid="tips-received">
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>${user?.total_tips_received?.toFixed(2) || '0.00'}</div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Tips Received</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    style={{ width: '100%' }}
                    data-testid="edit-display-name"
                  />
                  <textarea
                    placeholder="Bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    style={{ width: '100%' }}
                    data-testid="edit-bio"
                  />
                  <input
                    type="text"
                    placeholder="Wallet Address"
                    value={profile.wallet_address}
                    onChange={(e) => setProfile({ ...profile, wallet_address: e.target.value })}
                    style={{ width: '100%' }}
                    data-testid="edit-wallet"
                  />
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn-primary" onClick={handleProfileUpdate} data-testid="save-profile-btn">
                      Save Changes
                    </button>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)} data-testid="cancel-edit-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowUpload(true)}
            style={{ padding: '16px 48px', fontSize: '16px' }}
            data-testid="upload-content-btn"
          >
            <Upload size={20} style={{ marginRight: '8px' }} />
            Upload Content
          </button>
        </div>

        {/* My Content */}
        <h2 style={{ fontSize: '28px', marginBottom: '24px' }} data-testid="my-content-heading">My Content</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {myContent.map((content) => (
            <div key={content.id} className="glass-card" style={{ padding: '16px' }} data-testid={`content-card-${content.id}`}>
              {content.media_type === 'image' ? (
                <img src={content.media_url} alt={content.title} className="content-media" data-testid="content-image" />
              ) : (
                <video src={content.media_url} controls className="content-media" data-testid="content-video" />
              )}
              <h3 style={{ fontSize: '18px', marginTop: '12px' }} data-testid="content-title">{content.title}</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginTop: '8px' }} data-testid="content-description">
                {content.description}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', fontSize: '14px' }}>
                <span data-testid="content-likes">❤️ {content.likes}</span>
                <span data-testid="content-tips">${content.tips_received?.toFixed(2) || '0.00'} tips</span>
              </div>
            </div>
          ))}
        </div>

        {myContent.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.6)' }} data-testid="no-content">
            <p>No content yet. Upload your first creation!</p>
          </div>
        )}
      </div>

      {showUpload && <ContentUpload onClose={() => setShowUpload(false)} onSuccess={fetchMyContent} />}
    </div>
  );
};

export default ProfilePage;
