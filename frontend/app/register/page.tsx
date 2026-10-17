'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  Check,
  X,
  Smartphone,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { setUser, setToken } = useAuthStore();
  const { setItemCount } = useCartStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&#^()_\-+=]/.test(form.password),
  };
  const allPass = Object.values(passwordChecks).every(Boolean);

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
    if (!form.name.trim()) newErrors.name = 'Name required';
    else if (form.name.length < 2) newErrors.name = 'Min 2 chars';
    else if (form.name.length > 25) newErrors.name = 'Max 25 chars';

    if (!form.email.trim()) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Invalid email';

    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone))
      newErrors.phone = 'Invalid phone';

    if (!allPass) newErrors.password = 'Weak password';

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });

      setToken(response.token);
      setUser(response.user);

      try {
        await cartService.mergeGuestCart();
        const cart = await cartService.getCart();
        setItemCount(cart.itemCount);
      } catch {}

      toast.success(`Welcome to ሱቅShop, ${response.user.name}! 🎉`);
      router.push(redirectTo);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      const displayMessage = Array.isArray(message) ? message[0] : message;
      toast.error('Registration failed', { description: displayMessage });
      setErrors({ general: displayMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary/40" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/15 blur-[100px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Compact logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="text-xl font-bold">
            <span className="gradient-text">ሱቅ</span>
            <span className="text-foreground">Shop</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-primary/10 p-6">
          {/* Header */}
          <div className="text-center mb-5">
            <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
              Join Now
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Create <span className="gradient-text">Account</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Join ሱቅShop in seconds
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name + Phone in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
                      errors.name
                        ? 'border-destructive'
                        : 'border-primary/15 focus:border-primary'
                    }`}
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="text-destructive text-[11px] mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
                      errors.phone
                        ? 'border-destructive'
                        : 'border-primary/15 focus:border-primary'
                    }`}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive text-[11px] mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
                    errors.email
                      ? 'border-destructive'
                      : 'border-primary/15 focus:border-primary'
                  }`}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-[11px] mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password + Confirm in 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-10 rounded-xl text-xs sm:text-sm ${
                      errors.password
                        ? 'border-destructive'
                        : 'border-primary/15 focus:border-primary'
                    }`}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      handleChange('confirmPassword', e.target.value)
                    }
                    className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
                      errors.confirmPassword
                        ? 'border-destructive'
                        : 'border-primary/15 focus:border-primary'
                    }`}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-[11px] mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Password rules — Compact horizontal row */}
            {form.password && (
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-secondary/40 border border-primary/10">
                <Pill label="8+" passed={passwordChecks.length} />
                <Pill label="A-Z" passed={passwordChecks.upper} />
                <Pill label="a-z" passed={passwordChecks.lower} />
                <Pill label="0-9" passed={passwordChecks.number} />
                <Pill label="!@#" passed={passwordChecks.special} />
              </div>
            )}

            {/* General error */}
            {errors.general && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-xs text-center">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              size="default"
              className="w-full rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] text-muted-foreground font-medium">
                ALREADY A MEMBER?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 w-full h-10 sm:h-11 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold text-xs sm:text-sm transition-all"
          >
            Sign in instead
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
        passed
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-white text-muted-foreground border border-primary/10'
      }`}
    >
      {passed ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      {label}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}