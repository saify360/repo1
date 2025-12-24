'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Download } from 'lucide-react';
import { api } from '@/lib/api';
import ProductCard from './ProductCard';

interface StoreSectionProps {
  creatorId: string;
}

export default function StoreSection({ creatorId }: StoreSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setProducts([
      {
        id: '1',
        name: 'Premium Video Course',
        description: 'Learn advanced techniques with 10+ hours of content',
        price: 49.99,
        type: 'digital',
      },
      {
        id: '2',
        name: 'Exclusive Preset Pack',
        description: '50+ professionally crafted presets',
        price: 19.99,
        type: 'digital',
      },
      {
        id: '3',
        name: '1-on-1 Consultation',
        description: '30-minute personalized session',
        price: 99.99,
        type: 'digital',
      },
    ]);
    setLoading(false);
  }, [creatorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag size={48} className="text-white/30 mb-4" />
        <p className="text-white/60">No products available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
