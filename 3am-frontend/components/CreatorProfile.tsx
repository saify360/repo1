'use client';

import { useState } from 'react';
import { ArrowLeft, Store, Video, DollarSign, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StoreSection from './StoreSection';

interface CreatorProfileProps {
  creator: any;
}

export default function CreatorProfile({ creator }: CreatorProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'store' | 'about'>('feed');

  const tabs = [
    { id: 'feed', label: 'Posts', icon: Video },
    { id: 'store', label: 'Store', icon: Store },
    { id: 'about', label: 'About', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary/50 to-accent/50">
        {creator.banner_image && (
          <img
            src={creator.banner_image}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
        >
          <Share2 size={20} className="text-white" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="w-32 h-32 rounded-full border-4 border-black/50 overflow-hidden mb-4 bg-gradient-to-br from-primary to-accent">
          {creator.profile_image && (
            <img
              src={creator.profile_image}
              alt={creator.display_name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <h1 className="text-white text-3xl font-bold mb-1">
          {creator.display_name}
        </h1>
        <p className="text-white/60 mb-4">@{creator.username}</p>

        {creator.bio && (
          <p className="text-white/80 mb-6">{creator.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div>
            <div className="text-white text-2xl font-bold">125K</div>
            <div className="text-white/60 text-sm">Followers</div>
          </div>
          <div>
            <div className="text-white text-2xl font-bold">342</div>
            <div className="text-white/60 text-sm">Posts</div>
          </div>
          <div>
            <div className="text-white text-2xl font-bold">$12.5K</div>
            <div className="text-white/60 text-sm">Earned</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:scale-105 transition-all">
            Subscribe $5/mo
          </button>
          <button className="px-6 bg-white/10 backdrop-blur-md text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all">
            Tip
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-6 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60'
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-6">
        {activeTab === 'feed' && (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white/5 rounded-lg overflow-hidden hover:scale-105 transition-all cursor-pointer"
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'store' && <StoreSection creatorId={creator.id} />}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-2">About</h3>
              <p className="text-white/70">
                {creator.bio || 'No bio available'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-3">Milestones</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Member since</span>
                  <span className="text-white font-semibold">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total earnings</span>
                  <span className="text-white font-semibold">$12,543</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Content created</span>
                  <span className="text-white font-semibold">342</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
