import { api } from '@/lib/api';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'http://localhost:3000';

export const uploadService = {
  async uploadImage(file: File, folder = 'products'): Promise<string> {
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

  async uploadImages(files: File[], folder = 'products'): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<{ urls: string[] }>(
      `/uploads/images?folder=${folder}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return response.data.urls;
  },

  async deleteFile(filePath: string): Promise<boolean> {
    const response = await api.delete<{ success: boolean }>(
      `/uploads/file?path=${encodeURIComponent(filePath)}`,
    );
    return response.data.success;
  },

  getFullUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  },
};