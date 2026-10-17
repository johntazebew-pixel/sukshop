'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Settings,
  Tags,
  ArrowLeft,
  Shield,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import Loading from '../account/orders/[id]/loading';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

useEffect(() => {
  if (!isHydrated) return;  // ⚠️ MUST be here
  if (!isAuthenticated) {
    router.push('/login?redirect=/admin');
    return;
  }
  if (isAuthenticated && user && user.role !== 'ADMIN') {
    router.push('/');
  }
}, [isHydrated, isAuthenticated, user, router]);

if (!isHydrated) {
  return <Loading />;  // ⚠️ MUST be here
}

  // ==========================================
  // Loading state — while hydrating or waiting for user
  // ==========================================
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — waiting for redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // User not loaded yet — show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Not an admin — waiting for redirect
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Admin UI — user is confirmed admin
  // ==========================================
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ==========================================
              SIDEBAR
              ========================================== */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-3">
              {/* Admin Badge */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-4 text-white shadow-lg shadow-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Admin Panel
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-white/70 truncate">
                  {user.email}
                </p>
              </div>

              {/* Menu */}
              <nav className="rounded-2xl border border-primary/10 bg-white p-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Back to Shop */}
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-primary/10 bg-white text-muted-foreground hover:text-primary hover:border-primary/30 text-xs sm:text-sm font-medium transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Shop
              </Link>
            </div>
          </aside>

          {/* ==========================================
              MAIN CONTENT
              ========================================== */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}