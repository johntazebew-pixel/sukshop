import { api } from '@/lib/api';
import { Order } from '@/types';
import Cookies from 'js-cookie';

export const orderService = {
  async createOrder(data: {
    fullName: string;
    phone: string;
    city: string;
    street: string;
    postalCode?: string;
    notes?: string;
  }) {
    const sessionId = Cookies.get('sessionId');

    const response = await api.post<Order>('/orders', data, {
      headers: {
        ...(sessionId ? { 'x-session-id': sessionId } : {}),
      },
    });

    // Clear sessionId AFTER successful order
    if (sessionId) {
      Cookies.remove('sessionId');
    }

    return response.data;
  },

  async getMyOrders() {
    const response = await api.get<Order[]>('/orders/my-orders');
    return response.data;
  },

  async getMyOrder(id: number) {
    const response = await api.get<Order>(`/orders/my-orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: number, reason?: string) {
    const response = await api.post(`/orders/my-orders/${id}/cancel`, {
      reason,
    });
    return response.data;
  },
};