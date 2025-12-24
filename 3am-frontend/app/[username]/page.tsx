'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreatorProfile from '@/components/CreatorProfile';
import { api } from '@/lib/api';

export default function CreatorPage() {
  const params = useParams();
  const username = params.username as string;
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const data = await api.getCreator(username);
        setCreator(data);
      } catch (error) {
        console.error('Failed to fetch creator:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCreator();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/60">Creator not found</p>
      </div>
    );
  }

  return <CreatorProfile creator={creator} />;
}
