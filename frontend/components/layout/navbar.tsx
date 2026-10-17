'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Heart,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { cartService } from '@/services/cart.service';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/image-url';
import {
  TelegramConnectDialog,
  TelegramIcon,
} from '@/components/telegram/telegram-connect-dialog';
import { useTelegramStatus } from '@/hooks/use-telegram-status';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('ሱቅShop');
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { itemCount, setItemCount } = useCartStore();
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const { status: telegramStatus, refresh: refreshTelegram } =
    useTelegramStatus();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    api
      .get('/settings')
      .then((res) => {
        if (res.data.logoUrl) setLogoUrl(getImageUrl(res.data.logoUrl));
        if (res.data.siteName) setSiteName(res.data.siteName);
      })
      .catch(() => { });
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    cartService
      .getCart()
      .then((cart) => setItemCount(cart.itemCount))
      .catch(() => { });
  }, [mounted, setItemCount]);

  // Close overlays on route change
  useEffect(() => {
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Escape closes search
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    router.push(`/phones?search=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  // 🎯 Nav links with Track in the middle
  const links = [
    { href: '/', label: 'Home' },
    { href: '/phones', label: 'Phones' },
    { href: '/track', label: 'Track' },   // ⚠️ Between Phones and About
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const showItemCount = mounted && itemCount > 0;
  const showUser = mounted && isAuthenticated && user;
  const isAdmin = showUser && user.role === 'ADMIN';

  const isAmharic = siteName.startsWith('ሱቅ') || siteName.startsWith('ስቅ');
  const namePart1 = isAmharic ? siteName.substring(0, 2) : siteName.substring(0, 3);
  const namePart2 = isAmharic ? siteName.substring(2) : siteName.substring(3);

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative h-9 w-9 rounded-xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-all duration-300 bg-white/70">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <span className="flex items-center justify-center h-full text-primary font-bold text-sm">

              </span>
            )}
          </div>
          <div className="text-lg font-bold leading-none hidden sm:block">
            <span className="gradient-text">{namePart1}</span>
            <span className="text-foreground">{namePart2}</span>
          </div>
        </Link>

        {/* Desktop Nav — Track between Phones and About */}
        <nav className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-full border border-primary/20 backdrop-blur-sm">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions — Only search + cart + user */}
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="h-9 w-9 rounded-full border border-primary/20 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Cart Button */}
          <Link
            href="/cart"
            className="relative h-9 w-9 rounded-full border border-primary/20 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {showItemCount && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Telegram Notification Button - Only when user is logged in */}
          {showUser && (
            <>
              {/* Desktop Telegram Button */}
              <button
                type="button"
                onClick={() => setTelegramModalOpen(true)}
                className={`hidden md:flex items-center gap-1.5 px-3 h-9 rounded-full border text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm backdrop-blur-sm ${telegramStatus?.connected
                    ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300'
                  }`}
                title={
                  telegramStatus?.connected
                    ? `Telegram Connected (@${telegramStatus.username || 'user'}) - Click to manage`
                    : 'Connect Telegram for Instant Order Notifications'
                }
              >
                {telegramStatus?.connected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                    <TelegramIcon className="h-3.5 w-3.5 text-[#229ED9]" />
                    <span className="truncate max-w-[100px]">
                      {telegramStatus.username
                        ? `@${telegramStatus.username}`
                        : 'Telegram'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    <TelegramIcon className="h-3.5 w-3.5 text-[#229ED9] group-hover:scale-110 transition-transform" />
                    <span>Connect Telegram</span>
                  </>
                )}
              </button>

              {/* Mobile Action Bar Telegram Icon Button */}
              <button
                type="button"
                onClick={() => setTelegramModalOpen(true)}
                className={`md:hidden relative h-9 w-9 rounded-full border flex items-center justify-center transition-all ${telegramStatus?.connected
                    ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                    : 'border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600'
                  }`}
                aria-label="Telegram Notifications"
                title="Telegram Notifications"
              >
                <TelegramIcon className="h-4 w-4 text-[#229ED9]" />
                <span
                  className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${telegramStatus?.connected ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                />
              </button>
            </>
          )}

          {showUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full border-2 border-primary/40 flex items-center justify-center text-primary font-bold bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      asChild
                      className="rounded-lg cursor-pointer text-xs py-2 bg-primary/5 text-primary font-semibold focus:bg-primary/10"
                    >
                      <Link href="/admin">
                        <Shield className="mr-2 h-3.5 w-3.5" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer text-xs py-2"
                >
                  <Link href="/account">
                    <User className="mr-2 h-3.5 w-3.5 text-primary" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer text-xs py-2"
                >
                  <Link href="/account/orders">
                    <Package className="mr-2 h-3.5 w-3.5 text-primary" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer text-xs py-2"
                >
                  <Link href="/account/wishlist">
                    <Heart className="mr-2 h-3.5 w-3.5 text-primary" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setTelegramModalOpen(true)}
                  className="rounded-lg cursor-pointer text-xs py-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <TelegramIcon className="mr-2 h-3.5 w-3.5 text-[#229ED9]" />
                    Telegram Notifications
                  </div>
                  {telegramStatus?.connected ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Connected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      Connect
                    </span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="rounded-lg cursor-pointer text-xs py-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="hidden md:flex rounded-full px-4 h-9 bg-gradient-to-r from-primary to-accent font-semibold text-xs"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          <button
            className="lg:hidden h-9 w-9 rounded-full border border-primary/20 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="fixed top-0 left-0 right-0 z-[61] p-4 animate-in slide-in-from-top duration-200">
            <div className="container mx-auto max-w-2xl">
              <form
                onSubmit={handleSearch}
                className="relative rounded-2xl bg-white shadow-2xl"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for phones..."
                  className="w-full pl-12 pr-24 h-14 rounded-2xl border-2 border-primary/20 focus:border-primary text-sm bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!searchQuery.trim()}
                    className="rounded-xl h-10 px-5 bg-gradient-to-r from-primary to-accent font-semibold text-sm"
                  >
                    Search
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="h-10 w-10 rounded-xl hover:bg-secondary flex items-center justify-center"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {['iPhone', 'Samsung', 'Pixel', '256GB', 'Featured'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        router.push(
                          `/phones?search=${encodeURIComponent(tag)}`,
                        );
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-foreground transition-colors shadow-sm"
                    >
                      {tag}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-primary/10 bg-white/95 backdrop-blur-xl">
          <nav className="container mx-auto flex flex-col gap-1 p-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}

            {showUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setTelegramModalOpen(true);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${telegramStatus?.connected
                    ? 'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shrink-0">
                    <TelegramIcon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight font-bold">
                      Telegram Notifications
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground block">
                      {telegramStatus?.connected
                        ? `Connected (@${telegramStatus.username || 'user'})`
                        : 'Get instant order updates'}
                    </span>
                  </div>
                </div>
                {telegramStatus?.connected ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-bold text-sky-700 bg-white px-2.5 py-1 rounded-full border border-sky-200 shadow-sm">
                    Connect
                  </span>
                )}
              </button>
            )}

            {!showUser && (
              <Button asChild className="w-full mt-1 rounded-xl h-10 text-sm">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}

      {/* Telegram Connect / Status Dialog */}
      <TelegramConnectDialog
        open={telegramModalOpen}
        onOpenChange={setTelegramModalOpen}
        status={telegramStatus}
        onStatusUpdated={refreshTelegram}
      />
    </header>
  );
}
