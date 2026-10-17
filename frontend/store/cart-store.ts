import { create } from 'zustand';
import Cookies from 'js-cookie';

interface CartState {
  sessionId: string;
  itemCount: number;
  setItemCount: (count: number) => void;
  getSessionId: () => string;
}

export const useCartStore = create<CartState>((set) => ({
  sessionId: '',
  itemCount: 0,

  setItemCount: (count) => set({ itemCount: count }),

  getSessionId: () => {
    // ⚠️ Only access cookies on client
    if (typeof window === 'undefined') return '';

    let sessionId = Cookies.get('sessionId');
    if (!sessionId) {
      sessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      Cookies.set('sessionId', sessionId, { expires: 30 });
    }
    return sessionId;
  },
}));