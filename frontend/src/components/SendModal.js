import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { X, Send as SendIcon } from 'lucide-react';

const SendModal = ({ creator, contentId, onClose, onSuccess }) => {
  const { signer } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSend = async (e) => {
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
      toast.info('Processing send...');
      
      const recipientAddress = creator.wallet_address || '0x0000000000000000000000000000000000000000';
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther((parseFloat(amount) * 0.001).toString())
      });

      toast.info('Transaction sent. Waiting for confirmation...');
      await tx.wait();

      toast.success(`Sent $${amount} USDC successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send');
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
    }} onClick={onClose} data-testid="send-modal-overlay">
      <div className="glass-card" style={{
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()} data-testid="send-modal">
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
          data-testid="close-send-modal"
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }} data-testid="send-modal-title">
          Send to {creator.display_name}
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px', textAlign: 'center' }} data-testid="send-modal-subtitle">
          Direct USDC transfer
        </p>

        <form onSubmit={handleSend}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>Amount (USDC)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', fontSize: '18px' }}
              required
              data-testid="send-amount-input"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={processing}
            data-testid="submit-send-btn"
          >
            {processing ? 'Processing...' : `Send $${amount || '0.00'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendModal;
