'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, DollarSign, Lock } from 'lucide-react';
import GatedOverlay from './GatedOverlay';
import TipModal from './TipModal';

interface ContentCardProps {
  content: any;
  isActive: boolean;
}

export default function ContentCard({ content, isActive }: ContentCardProps) {
  const [showGate, setShowGate] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleTap = () => {
    if (content.is_gated) {
      setShowGate(true);
    }
  };

  const handleLongPress = () => {
    // Could expand to full view or show more options
    console.log('Long press detected');
  };

  return (
    <div className="relative h-full w-full bg-black">
      {/* Content Media */}
      <div className="absolute inset-0" onClick={handleTap}>
        {content.type === 'video' ? (
          <video
            src={content.preview_url}
            className="w-full h-full object-cover"
            autoPlay={isActive}
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={content.preview_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Content Info */}
      <div className="absolute bottom-20 left-0 right-0 p-6 z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
              {content.title}
            </h2>
            {content.description && (
              <p className="text-white/90 text-sm mb-3 drop-shadow-lg line-clamp-2">
                {content.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                <span className="text-white font-semibold drop-shadow-lg">
                  @{content.username}
                </span>
              </div>
              {content.is_gated && (
                <div className="flex items-center gap-1 bg-primary/80 px-3 py-1 rounded-full">
                  <Lock size={14} />
                  <span className="text-xs font-semibold">
                    ${content.price || 'Subscribe'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Heart
                  size={24}
                  className={`${liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </div>
              <span className="text-white text-xs font-semibold">12.5K</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <MessageCircle size={24} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">342</span>
            </button>

            <button
              onClick={() => setShowTipModal(true)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center group-hover:scale-110 transition-all shadow-lg">
                <DollarSign size={24} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Tip</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Share2 size={24} className="text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Gated Content Overlay */}
      {showGate && (
        <GatedOverlay
          content={content}
          onClose={() => setShowGate(false)}
        />
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <TipModal
          content={content}
          onClose={() => setShowTipModal(false)}
        />
      )}
    </div>
  );
}
