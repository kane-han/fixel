import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  showLoginModal: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setShowLoginModal: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  showLoginModal: false,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
  setShowLoginModal: (v) => set({ showLoginModal: v }),
}));
