'use client';

import { useState } from 'react';
import { X, Lock, CreditCard } from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

interface GatedOverlayProps {
  content: any;
  onClose: () => void;
}

export default function GatedOverlay({ content, onClose }: GatedOverlayProps) {
  const { user, balance, updateBalance } = useStore();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (!user) {
      alert('Please sign in to unlock content');
      return;
    }

    setUnlocking(true);
    try {
      if (content.gate_type === 'paid') {
        // Check balance
        if (balance < content.price) {
          alert('Insufficient balance. Please add credits.');
          setUnlocking(false);
          return;
        }

        // Process payment via tip (purchase)
        await api.tipCreator(user.id, content.username, content.price, content.id);
        await updateBalance(user.id);
        onClose();
      } else if (content.gate_type === 'subscribe') {
        // Navigate to subscription flow
        window.location.href = `/${content.username}?action=subscribe`;
      }
    } catch (error) {
      console.error('Failed to unlock:', error);
      alert('Failed to unlock content');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/90 content-blur z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-sm mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <X size={20} className="text-white" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <Lock size={32} className="text-white" />
          </div>
          <h3 className="text-white text-2xl font-bold mb-2">
            {content.gate_type === 'paid' ? 'Premium Content' : 'Subscriber Only'}
          </h3>
          <p className="text-white/70">
            {content.gate_type === 'paid'
              ? `Unlock this content for $${content.price}`
              : 'Subscribe to access exclusive content'}
          </p>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Your Balance</span>
              <span className="text-white font-bold text-lg">${balance.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleUnlock}
          disabled={unlocking}
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
        >
          {unlocking ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
          ) : (
            <>
              <CreditCard size={20} />
              {content.gate_type === 'paid' ? `Unlock for $${content.price}` : 'Subscribe Now'}
            </>
          )}
        </button>

        {balance < (content.price || 0) && content.gate_type === 'paid' && (
          <button
            className="w-full mt-3 text-primary font-semibold py-3 hover:underline"
            onClick={() => window.location.href = '/add-credits'}
          >
            Add Credits
          </button>
        )}
      </div>
    </div>
  );
}
