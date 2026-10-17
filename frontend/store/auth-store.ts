import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;        // ⚠️ MUST exist
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHydrated: () => void;    // ⚠️ MUST exist
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        Cookies.set('token', token, {
          expires: 7,
          sameSite: 'lax',
          path: '/',
        });
      } else {
        Cookies.remove('token');
      }
    }
    set({ token, isAuthenticated: !!token });
  },

  setHydrated: () => {
    if (typeof window === 'undefined') return;
    const token = Cookies.get('token');
    set({
      token: token || null,
      isAuthenticated: !!token,
      isHydrated: true,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      Cookies.remove('token');
      Cookies.remove('sessionId');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));