'use client';

import { useEffect, useState } from 'react';
import FeedView from '@/components/FeedView';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/lib/store';

export default function Home() {
  const { fetchFeed, isLoading } = useStore();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="relative h-screen overflow-hidden">
      <FeedView />
      <BottomNav />
    </main>
  );
}
