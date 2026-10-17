import { create } from 'zustand';
import { SiteSettings } from '@/services/settings.service';

interface SettingsState {
  settings: SiteSettings | null;
  isLoading: boolean;
  setSettings: (settings: SiteSettings) => void;
  getLogoUrl: () => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: true,

  setSettings: (settings) => set({ settings, isLoading: false }),

  getLogoUrl: () => {
    const settings = get().settings;
    if (!settings?.logoUrl) return '/logo.png'; // ነባሪ

    // Full URL ካልሆነ → Backend URL ያክሉ
    if (settings.logoUrl.startsWith('http')) return settings.logoUrl;

    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${API_URL}${settings.logoUrl}`;
  },
}));