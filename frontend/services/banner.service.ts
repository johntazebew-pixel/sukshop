import { api } from '@/lib/api';

export interface Banner {
  id: number;
  titleEn: string;
  titleAm: string;
  subtitleEn?: string;
  subtitleAm?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

export const bannerService = {
  async getAll() {
    const response = await api.get<Banner[]>('/banners');
    return response.data;
  },
};