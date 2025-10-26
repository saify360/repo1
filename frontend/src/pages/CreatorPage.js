import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { Heart, DollarSign, Send, Sparkles, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import TipModal from '../components/TipModal';
import SendModal from '../components/SendModal';

const CreatorPage = () => {
  const { username } = useParams();
  const { user, API, signer, connectWallet, walletAddress } = useContext(AuthContext);
  const [creator, setCreator] = useState(null);
  const [content, setContent] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchCreator();
    fetchContent();
    checkSubscription();
  }, [username]);

  const fetchCreator = async () => {
    try {
      const response = await axios.get(`${API}/profile/${username}`);
      setCreator(response.data);
    } catch (error) {
      toast.error('Creator not found');
    }
  };

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content/user/${username}`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API}/subscriptions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const sub = response.data.find(s => s.creator_username === username);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      await axios.post(`${API}/subscribe`, 
        { creator_username: username },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setIsSubscribed(true);
      toast.success('Subscribed successfully!');
      fetchCreator();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to subscribe');
    }
  };

  const handleTip = (contentId = null) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      connectWallet();
      return;
    }
    setSelectedContent(contentId);
    setShowTipModal(true);
  };

  const handleSend = (contentId = null) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      connectWallet();
      return;
    }
    setSelectedContent(contentId);
    setShowSendModal(true);
  };

  const handleMint = async (contentId) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      connectWallet();
      return;
    }

    try {
      toast.info('Preparing NFT mint...');
      
      // Simulate minting (in production, call actual smart contract)
      const tx = await signer.sendTransaction({
        to: creator.wallet_address || '0x0000000000000000000000000000000000000000',
        value: ethers.parseEther('0.001')
      });

      toast.info('Minting NFT... Please wait');
      await tx.wait();

      await axios.post(`${API}/mint`,
        { content_id: contentId, tx_hash: tx.hash },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint NFT');
    }
  };

  if (!creator) {
    return (
      <div data-testid="loading-creator">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div data-testid="creator-page">
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Creator Header */}
        <div className="glass-card" style={{ padding: '40px', marginBottom: '32px' }} data-testid="creator-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: creator.profile_image 
                ? `url(${creator.profile_image})` 
                : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '4px solid rgba(255, 255, 255, 0.1)'
            }} data-testid="creator-avatar" />

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }} data-testid="creator-name">
                {creator.display_name}
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px' }} data-testid="creator-username">
                @{creator.username}
              </p>
              <p style={{ marginBottom: '20px' }} data-testid="creator-bio">{creator.bio || 'No bio yet'}</p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {!isSubscribed ? (
                  <button className="cta-subscribe" onClick={handleSubscribe} data-testid="subscribe-btn">
                    <UserPlus size={18} /> Subscribe
                  </button>
                ) : (
                  <button className="cta-subscribe" style={{ opacity: 0.6 }} disabled data-testid="subscribed-btn">
                    ✓ Subscribed
                  </button>
                )}
                <button className="cta-tip" onClick={() => handleTip()} data-testid="tip-creator-btn">
                  <DollarSign size={18} /> Tip
                </button>
                <button className="cta-send" onClick={() => handleSend()} data-testid="send-creator-btn">
                  <Send size={18} /> Send
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700' }} data-testid="creator-subscribers">
                {creator.subscriber_count || 0}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Subscribers</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <h2 style={{ fontSize: '28px', marginBottom: '24px' }} data-testid="content-heading">Content</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {content.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }} data-testid={`content-${item.id}`}>
              {item.media_type === 'image' ? (
                <img src={item.media_url} alt={item.title} className="content-media" style={{ margin: 0, borderRadius: '16px 16px 0 0' }} data-testid="content-image" />
              ) : (
                <video src={item.media_url} controls className="content-media" style={{ margin: 0, borderRadius: '16px 16px 0 0' }} data-testid="content-video" />
              )}
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }} data-testid="content-title">{item.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '16px' }} data-testid="content-description">
                  {item.description}
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {item.cta_buttons.includes('tip') && (
                    <button className="cta-tip" style={{ fontSize: '14px', padding: '8px 16px' }} onClick={() => handleTip(item.id)} data-testid="tip-content-btn">
                      <DollarSign size={16} /> Tip
                    </button>
                  )}
                  {item.cta_buttons.includes('send') && (
                    <button className="cta-send" style={{ fontSize: '14px', padding: '8px 16px' }} onClick={() => handleSend(item.id)} data-testid="send-content-btn">
                      <Send size={16} /> Send
                    </button>
                  )}
                  {item.cta_buttons.includes('mint') && (
                    <button className="cta-mint" style={{ fontSize: '14px', padding: '8px 16px' }} onClick={() => handleMint(item.id)} data-testid="mint-content-btn">
                      <Sparkles size={16} /> Mint
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <span data-testid="content-likes">❤️ {item.likes}</span>
                  <span data-testid="content-tips-amount">${item.tips_received?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {content.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.6)' }} data-testid="no-content">
            <p>No content available yet</p>
          </div>
        )}
      </div>

      {showTipModal && (
        <TipModal
          creator={creator}
          contentId={selectedContent}
          onClose={() => setShowTipModal(false)}
          onSuccess={() => {
            setShowTipModal(false);
            fetchCreator();
            fetchContent();
          }}
        />
      )}

      {showSendModal && (
        <SendModal
          creator={creator}
          contentId={selectedContent}
          onClose={() => setShowSendModal(false)}
          onSuccess={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
};

export default CreatorPage;
