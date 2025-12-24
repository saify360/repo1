import { create } from 'zustand';
import { api } from './api';

interface ContentItem {
  id: string;
  creator_id: string;
  username: string;
  title: string;
  description: string;
  preview_url: string;
  full_content_url: string;
  is_gated: boolean;
  gate_type: 'free' | 'paid' | 'subscribe';
  price?: number;
  type: 'post' | 'video' | 'image';
}

interface User {
  id: string;
  username: string;
  display_name: string;
  profile_image?: string;
  balance?: number;
}

interface Store {
  isLoading: boolean;
  feed: ContentItem[];
  currentIndex: number;
  user: User | null;
  balance: number;
  fetchFeed: () => Promise<void>;
  setCurrentIndex: (index: number) => void;
  setUser: (user: User | null) => void;
  updateBalance: (userId: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  isLoading: false,
  feed: [],
  currentIndex: 0,
  user: null,
  balance: 0,

  fetchFeed: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getFeed(50);
      set({ feed: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      set({ isLoading: false });
    }
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },

  setUser: (user: User | null) => {
    set({ user });
    if (user) {
      get().updateBalance(user.id);
    }
  },

  updateBalance: async (userId: string) => {
    try {
      const data = await api.getBalance(userId);
      set({ balance: data.ledger?.balance || 0 });
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  },
}));
