'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import ContentCard from './ContentCard';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function FeedView() {
  const { feed, currentIndex, setCurrentIndex } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Snap to current item on mount
  useEffect(() => {
    if (containerRef.current && feed.length > 0) {
      const container = containerRef.current;
      container.scrollTo({
        top: currentIndex * window.innerHeight,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, feed.length]);

  // Handle scroll snap
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const itemHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < feed.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped up
      if (currentIndex < feed.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    if (touchStart - touchEnd < -75) {
      // Swiped down
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const navigate = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < feed.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (feed.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white/60 text-lg">No content available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {feed.map((content, index) => (
        <div
          key={content.id}
          className="h-screen w-full snap-start relative"
        >
          <ContentCard
            content={content}
            isActive={index === currentIndex}
          />
        </div>
      ))}

      {/* Navigation arrows for desktop */}
      <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        <button
          onClick={() => navigate('down')}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronUp size={24} className="text-white" />
        </button>
        <button
          onClick={() => navigate('up')}
          disabled={currentIndex === feed.length - 1}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronDown size={24} className="text-white" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
        {feed.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary h-12'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
