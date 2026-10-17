'use client';

import { useState } from 'react';
import { Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image-url';

interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const displayImages =
    images && images.length > 0
      ? images
      : [{ id: 0, url: '', isMain: true }];

  const currentImage = displayImages[selectedIndex];

  const next = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prev = () => {
    setSelectedIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-3xl overflow-hidden border border-primary/10 bg-gradient-to-br from-secondary/30 to-secondary group"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        {currentImage.url ? (
          <img
            src={getImageUrl(currentImage.url)}
            alt={productName}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              zoom ? 'scale-110' : 'scale-100'
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Smartphone className="h-32 w-32 text-primary/20" />
          </div>
        )}

        {/* Navigation */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-xs font-semibold">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {displayImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                index === selectedIndex
                  ? 'border-primary shadow-lg shadow-primary/20'
                  : 'border-primary/10 hover:border-primary/40'
              }`}
            >
              {img.url ? (
                <img
                  src={getImageUrl(img.url)}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary">
                  <Smartphone className="h-6 w-6 text-primary/30" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}