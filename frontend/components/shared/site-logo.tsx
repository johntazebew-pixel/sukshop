'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settings-store';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function SiteLogo({ size = 'md', showText = true }: SiteLogoProps) {
  const { settings, getLogoUrl } = useSettingsStore();

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const logoSrc = getLogoUrl();

  const siteName = settings?.siteName || 'ሱቅShop';
  const isAmharic = siteName.startsWith('ሱቅ') || siteName.startsWith('ስቅ');
  const part1 = isAmharic ? 'ሱቅ' : siteName.substring(0, 3);
  const part2 = isAmharic ? siteName.substring(2) : siteName.substring(3);

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className={`relative ${sizes[size]} rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 bg-primary/10`}>
        <Image
          src={logoSrc}
          alt={siteName}
          fill
          className="object-contain p-1"
          priority
        />
      </div>
      {showText && (
        <div className={`font-bold ${size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
          <span className="gradient-text">
            {part1}
          </span>
          <span className="text-foreground">
            {part2}
          </span>
        </div>
      )}
    </Link>
  );
}