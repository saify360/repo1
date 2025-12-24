'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user, balance, updateBalance } = useStore();
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      alert('Please sign in to purchase');
      return;
    }

    if (balance < product.price) {
      alert('Insufficient balance. Please add credits.');
      window.location.href = '/add-credits';
      return;
    }

    setPurchasing(true);
    try {
      await api.purchaseProduct(user.id, product.id);
      await updateBalance(user.id);
      setPurchased(true);
      // Show success message or download link
    } catch (error) {
      console.error('Failed to purchase:', error);
      alert('Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white text-lg font-bold mb-2">{product.name}</h3>
          <p className="text-white/70 text-sm mb-4">{product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-primary text-2xl font-bold">
              ${product.price}
            </span>
            <span className="text-white/50 text-sm line-through">
              ${(product.price * 1.3).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={purchasing || purchased}
        className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
          purchased
            ? 'bg-green-500/20 text-green-400 cursor-default'
            : 'bg-gradient-to-r from-primary to-accent text-white hover:scale-105'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {purchasing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
        ) : purchased ? (
          <>
            <Check size={20} />
            Purchased
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            Buy Now
          </>
        )}
      </button>
    </div>
  );
}
