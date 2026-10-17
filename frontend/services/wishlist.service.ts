import { api } from '@/lib/api';
import { Product } from '@/types';

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await api.get<WishlistItem[]>('/wishlist');
    return response.data;
  },

  async toggle(productId: number): Promise<{ added: boolean; message: string }> {
    const response = await api.post(`/wishlist/toggle/${productId}`);
    return response.data;
  },

  async check(productId: number): Promise<{ inWishlist: boolean }> {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  },

  async remove(productId: number) {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data;
  },
};