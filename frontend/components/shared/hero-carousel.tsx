'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Banner } from '@/services/banner.service';
import { getImageUrl } from '@/lib/image-url';

interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const goTo = useCallback((index: number) => setCurrent(index), []);
  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % banners.length),
    [banners.length],
  );
  const prev = useCallback(
    () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length),
    [banners.length],
  );

  // No banners fallback
  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect <span className="gradient-text">Mobile Phone</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Shop authentic iPhones and Samsung Galaxy phones in Ethiopia.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/phones">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[320px] md:h-[400px] lg:h-[440px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === current
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background */}
            <div className="absolute inset-0">
              {banner.imageUrl ? (
                <img
                  src={getImageUrl(banner.imageUrl)}
                  alt={banner.titleEn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex items-center">
              <div className="max-w-2xl">
                <div
                  className={`transition-all duration-700 delay-100 ${
                    index === current
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 rounded-full mb-3 shadow-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    NEW ARRIVAL
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                    {banner.titleEn}
                  </h1>

                  {/* Amharic */}
                  {banner.titleAm && (
                    <p className="text-sm md:text-base text-primary font-semibold mb-2">
                      {banner.titleAm}
                    </p>
                  )}

                  {/* Subtitle */}
                  {banner.subtitleEn && (
                    <p className="text-sm md:text-base text-white/90 mb-5 max-w-md">
                      {banner.subtitleEn}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full px-5 h-10 text-sm glow-green"
                    >
                      <Link href={banner.linkUrl || '/phones'}>
                        Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-full px-5 h-10 text-sm bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white hover:text-foreground"
                    >
                      <Link href="/phones">View All</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      {banners.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 transition-all flex items-center justify-center text-white group"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Right Arrow */}
      {banners.length > 1 && (
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 transition-all flex items-center justify-center text-white group"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}