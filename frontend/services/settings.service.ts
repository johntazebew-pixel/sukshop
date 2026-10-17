import { api } from '@/lib/api';

export interface SiteSettings {
  logoUrl: string;
  siteName: string;
  siteNameEn: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
}

export const settingsService = {
  async getAll(): Promise<SiteSettings> {
    const response = await api.get<SiteSettings>('/settings');
    return response.data;
  },

  async update(settings: Partial<SiteSettings>) {
    const response = await api.post('/settings/bulk', settings);
    return response.data;
  },

  async uploadImage(file: File, folder = 'logos'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ url: string }>(
      `/uploads/image?folder=${folder}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return response.data.url;
  },
};