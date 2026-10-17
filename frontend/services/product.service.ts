import { api } from '@/lib/api';
import { Category, Product } from '@/types';

export const productService = {
  async getAll(params?: {
    subcategoryId?: number;
    featured?: boolean;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get<Product>(`/products/slug/${slug}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
};

export const categoryService = {
  async getAll() {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get<Category>(`/categories/slug/${slug}`);
    return response.data;
  },
};