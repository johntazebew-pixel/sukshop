import { api } from '@/lib/api';
import { Cart } from '@/types';
import Cookies from 'js-cookie';

// ⚠️ Get or create session ID — persists for 30 days
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = Cookies.get('sessionId');
  if (!sessionId) {
    sessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    Cookies.set('sessionId', sessionId, {
      expires: 30,
      sameSite: 'lax',
      path: '/',
    });
  }
  return sessionId;
}

export const cartService = {
  async getCart() {
    const sessionId = getSessionId();
    const response = await api.get<Cart>('/cart', {
      headers: { 'x-session-id': sessionId },
    });
    return response.data;
  },

  async addToCart(productId: number, quantity: number) {
    const sessionId = getSessionId();
    const response = await api.post(
      '/cart/add',
      { productId, quantity, sessionId },
      { headers: { 'x-session-id': sessionId } },
    );
    return response.data;
  },

  async updateItem(itemId: number, quantity: number) {
    const sessionId = getSessionId();
    const response = await api.patch(
      `/cart/item/${itemId}`,
      { quantity },
      { headers: { 'x-session-id': sessionId } },
    );
    return response.data;
  },

  async removeItem(itemId: number) {
    const sessionId = getSessionId();
    const response = await api.delete(`/cart/item/${itemId}`, {
      headers: { 'x-session-id': sessionId },
    });
    return response.data;
  },

  async clearCart() {
    const sessionId = getSessionId();
    const response = await api.delete('/cart/clear', {
      headers: { 'x-session-id': sessionId },
    });
    return response.data;
  },

  // ⚠️ Merge guest cart — DO NOT remove sessionId
  async mergeGuestCart() {
    const sessionId = Cookies.get('sessionId');
    if (!sessionId) return null;

    try {
      const response = await api.post('/cart/merge', { sessionId });
      console.log('✅ Merge result:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ Merge failed:', err.response?.data || err.message);
      return null;
    }
  },
};