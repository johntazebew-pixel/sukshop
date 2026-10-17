'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/image-url';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [settings, setSettings] = useState({
    siteName: 'ሱቅShop',
    tagline: "Ethiopia's trusted mobile phone store",
    phone: '+251 918743647',
    email: 'johntazebew@gmail.com',
    address: 'CMC, Addis Ababa, Ethiopia',
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    api
      .get('/settings')
      .then((res) => {
        if (res.data.logoUrl) setLogoUrl(getImageUrl(res.data.logoUrl));
        setSettings({
          siteName: res.data.siteName || 'ሱቅShop',
          tagline:
            res.data.tagline || "Ethiopia's trusted mobile phone store",
          phone: res.data.phone || '+251 918743647',
          email: res.data.email || 'johntazebew@gmail.com',
          address: res.data.address || 'CMC, Addis Ababa, Ethiopia',
        });
      })
      .catch(() => { });
  }, [mounted]);

  const isAmharic = settings.siteName.startsWith('ሱቅ') || settings.siteName.startsWith('ስቅ');
  const namePart1 = isAmharic ? settings.siteName.substring(0, 2) : settings.siteName.substring(0, 3);
  const namePart2 = isAmharic ? settings.siteName.substring(2) : settings.siteName.substring(3);

  return (
    <footer className="relative mt-24 bg-gradient-to-b from-background via-secondary/40 to-secondary/80">
      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative container mx-auto px-4 pt-20 pb-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-white shadow-lg">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <span className="flex items-center justify-center h-full text-primary font-bold text-lg">
                    ሱ
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">
                <span className="gradient-text">{namePart1}</span>
                <span className="text-foreground">{namePart2}</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-xl bg-white hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-xl bg-white hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-xl bg-white hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold mb-6 text-foreground text-lg">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/phones"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  All Phones
                </Link>
              </li>
              <li>
                <Link
                  href="/phones?category=iphone"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  iPhone
                </Link>
              </li>
              <li>
                <Link
                  href="/phones?category=samsung"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Samsung
                </Link>
              </li>
              <li>
                <Link
                  href="/phones?featured=true"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold mb-6 text-foreground text-lg">Account</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/account"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-6 text-foreground text-lg">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <div className="h-10 w-10 rounded-xl bg-white group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="pt-2.5">{settings.address}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground group">
                <div className="h-10 w-10 rounded-xl bg-white group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="pt-2.5">{settings.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground group">
                <div className="h-10 w-10 rounded-xl bg-white group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="pt-2.5">{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear}{' '}
              <span className="font-bold text-foreground">
                {settings.siteName}
              </span>
              . All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}