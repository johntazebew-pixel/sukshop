'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { setUser, setToken } = useAuthStore();
  const { setItemCount } = useCartStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Login
      const response = await authService.login(form);
      setToken(response.token);
      setUser(response.user);

      // 2. Wait for cookie
      await new Promise((r) => setTimeout(r, 200));

      // 3. Merge guest cart (sessionId stays)
      try {
        await cartService.mergeGuestCart();
      } catch (err) {
        console.warn('Merge failed (non-fatal):', err);
      }

      // 4. Load cart count
      try {
        const cart = await cartService.getCart();
        setItemCount(cart.itemCount);
      } catch {}

      // 5. Toast
      if (response.user.role === 'ADMIN') {
        toast.success(`Welcome back, Admin ${response.user.name}! 👑`);
      } else {
        toast.success(`Welcome back, ${response.user.name}! 🎉`);
      }

      // 6. Redirect
      const finalRedirect =
        redirectTo !== '/'
          ? redirectTo
          : response.user.role === 'ADMIN'
          ? '/admin'
          : '/';

      router.push(finalRedirect);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Invalid email or password';
      toast.error('Login failed', { description: message });
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary/40" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/15 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="text-xl font-bold">
            <span className="gradient-text">ሱቅ</span>
            <span className="text-foreground">Shop</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl p-6">
          <div className="text-center mb-5">
            <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
              Account Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
                    errors.email ? 'border-destructive' : 'border-primary/15'
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-[11px] mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`pl-10 pr-10 h-10 rounded-xl text-xs sm:text-sm ${
                    errors.password ? 'border-destructive' : 'border-primary/15'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-[11px] mt-1">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-xs text-center">{errors.general}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              size="default"
              className="w-full rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] text-muted-foreground font-medium">
                NEW HERE?
              </span>
            </div>
          </div>

          <Link
            href="/register"
            className="flex items-center justify-center gap-1.5 w-full h-10 sm:h-11 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold text-xs sm:text-sm transition-all"
          >
            Create an account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}