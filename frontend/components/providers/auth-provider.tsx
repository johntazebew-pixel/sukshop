'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isHydrated, setHydrated, setUser, setToken, logout } =
    useAuthStore();
  const { setItemCount } = useCartStore();

  // Step 1: Hydrate token from cookies (runs once)
  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  // Step 2: If we have a token, load user profile
  useEffect(() => {
    if (!isHydrated) return;

    const token = useAuthStore.getState().token;
    if (!token) return;

    // Skip if already have user
    if (useAuthStore.getState().user) return;

    const loadUser = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (error: any) {
        // Token invalid or expired
        if (error.response?.status === 401) {
          logout();
        }
        // Network error → keep token, try again later
      }
    };

    loadUser();
  }, [isHydrated, setUser, logout]);

  // Step 3: Load cart count
  useEffect(() => {
    if (!isHydrated) return;

    const loadCart = async () => {
      try {
        const cart = await cartService.getCart();
        setItemCount(cart.itemCount);
      } catch {
        // Silent fail
      }
    };

    loadCart();
  }, [isHydrated, setItemCount]);

  return <>{children}</>;
}