import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};