'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export interface TelegramStatusData {
  connected: boolean;
  username?: string;
  connectedAt?: string;
  chatId?: string;
  botUsername?: string;
}

export function useTelegramStatus() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [status, setStatus] = useState<TelegramStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/notifications/telegram/status');
      setStatus(res.data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchStatus();
    } else if (isHydrated && !isAuthenticated) {
      setStatus(null);
      setLoading(false);
    }
  }, [isHydrated, isAuthenticated, fetchStatus]);

  useEffect(() => {
    const handleStatusUpdate = () => {
      fetchStatus();
    };

    window.addEventListener('telegram-status-updated', handleStatusUpdate);
    return () => {
      window.removeEventListener('telegram-status-updated', handleStatusUpdate);
    };
  }, [fetchStatus]);

  return {
    status,
    loading,
    refresh: fetchStatus,
  };
}

export function notifyTelegramStatusUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('telegram-status-updated'));
  }
}
