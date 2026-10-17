'use client';

import { useEffect } from 'react';
import { settingsService } from '@/services/settings.service';
import { useSettingsStore } from '@/store/settings-store';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { setSettings } = useSettingsStore();

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await settingsService.getAll();
        setSettings(settings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    load();
  }, [setSettings]);

  return <>{children}</>;
}