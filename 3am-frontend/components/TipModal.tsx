'use client';

import { useState } from 'react';
import { X, DollarSign, Heart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

interface TipModalProps {
  content: any;
  onClose: () => void;
}

export default function TipModal({ content, onClose }: TipModalProps) {
  const { user, balance, updateBalance } = useStore();
  const [amount, setAmount] = useState<number>(1);
  const [sending, setSending] = useState(false);

  const quickAmounts = [1, 3, 5, 10, 20];

  const handleSendTip = async () => {
    if (!user) {
      alert('Please sign in to send tips');
      return;
    }

    if (balance < amount) {
      alert('Insufficient balance. Please add credits.');
      return;
    }

    setSending(true);
    try {
      await api.tipCreator(user.id, content.username, amount, content.id);
      await updateBalance(user.id);
      onClose();
      // Show success message
    } catch (error) {
      console.error('Failed to send tip:', error);
      alert('Failed to send tip');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/90 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-t-3xl md:rounded-3xl p-6 w-full md:max-w-md mx-0 md:mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <X size={20} className="text-white" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Heart size={28} className="text-white" />
          </div>
          <h3 className="text-white text-2xl font-bold mb-2">Send a Tip</h3>
          <p className="text-white/70">Support @{content.username}</p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {quickAmounts.map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value)}
              className={`py-3 rounded-xl font-bold transition-all ${
                amount === value
                  ? 'bg-gradient-to-r from-primary to-accent text-white scale-105'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              ${value}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <label className="text-white/70 text-sm mb-2 block">Custom Amount</label>
          <div className="relative">
            <DollarSign
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white text-xl font-bold focus:outline-none focus:border-primary transition-all"
              placeholder="0.00"
              step="0.01"
              min="0.01"
            />
          </div>
        </div>

        {/* Balance */}
        {user && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Your Balance</span>
              <span className="text-white font-bold">${balance.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendTip}
          disabled={sending || amount <= 0}
          className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto" />
          ) : (
            `Send $${amount.toFixed(2)}`
          )}
        </button>

        {balance < amount && (
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
