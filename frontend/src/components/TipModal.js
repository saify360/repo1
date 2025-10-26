import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { X, DollarSign } from 'lucide-react';

const TipModal = ({ creator, contentId, onClose, onSuccess }) => {
  const { token, API, signer } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleTip = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!signer) {
      toast.error('Please connect your wallet');
      return;
    }

    setProcessing(true);

    try {
      toast.info('Processing tip...');
      
      // Send transaction (for testnet, we send ETH as USDC placeholder)
      const recipientAddress = creator.wallet_address || '0x0000000000000000000000000000000000000000';
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther((parseFloat(amount) * 0.001).toString()) // Simulate USDC with small ETH amount
      });

      toast.info('Transaction sent. Waiting for confirmation...');
      await tx.wait();

      // Record tip in backend
      await axios.post(`${API}/tip`, {
        recipient_username: creator.username,
        amount: parseFloat(amount),
        tx_hash: tx.hash,
        content_id: contentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Tipped $${amount} successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Tip error:', error);
      toast.error('Failed to send tip');
    } finally {
      setProcessing(false);
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
    }} onClick={onClose} data-testid="tip-modal-overlay">
      <div className="glass-card" style={{
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()} data-testid="tip-modal">
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
          data-testid="close-tip-modal"
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }} data-testid="tip-modal-title">
          Tip {creator.display_name}
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px', textAlign: 'center' }} data-testid="tip-modal-subtitle">
          Support this creator with USDC
        </p>

        <form onSubmit={handleTip}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>Amount (USDC)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={20} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', paddingLeft: '48px', fontSize: '18px' }}
                required
                data-testid="tip-amount-input"
              />
            </div>
          </div>

          {/* Quick amount buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {[5, 10, 25, 50].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value.toString())}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                data-testid={`quick-tip-${value}`}
              >
                ${value}
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={processing}
            data-testid="submit-tip-btn"
          >
            {processing ? 'Processing...' : `Tip $${amount || '0.00'}`}
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
          Tips are sent via Mumbai testnet. Small network fee applies.
        </p>
      </div>
    </div>
  );
};

export default TipModal;
