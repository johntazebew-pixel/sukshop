'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Star,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadService } from '@/services/upload.service';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  folder = 'products',
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:3000';

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadService.uploadImages(files, folder);
      onChange([...images, ...urls]);
      toast.success(
        `${urls.length} image${urls.length > 1 ? 's' : ''} uploaded ✅`,
      );
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.response?.data?.message || 'Try again',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const newImages = [images[index], ...images.filter((_, i) => i !== index)];
    onChange(newImages);
    toast.success('Set as main image ✅');
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || uploading || images.length >= maxImages}
          className="hidden"
          id={`image-upload-${folder}`}
        />
        <label
          htmlFor={`image-upload-${folder}`}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            disabled || uploading || images.length >= maxImages
              ? 'border-primary/10 bg-secondary/30 cursor-not-allowed opacity-60'
              : 'border-primary/30 hover:border-primary hover:bg-primary/5'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs font-semibold text-primary">Uploading...</p>
            </>
          ) : images.length >= maxImages ? (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground">
                Maximum {maxImages} images reached
              </p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Click to upload images</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  PNG, JPG, WEBP, SVG • Max 5MB each • Up to {maxImages} images
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden bg-secondary group"
            >
              <Image
                src={getFullUrl(url)}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
                unoptimized
              />

              {/* Main Badge */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Main
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(index)}
                    className="h-7 w-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                    title="Set as main"
                  >
                    <Star className="h-3 w-3 text-primary" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="h-7 w-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Number Badge */}
              <div className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-full bg-black/70 text-white text-[9px] font-bold flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add More */}
          {images.length < maxImages && (
            <label
              htmlFor={`image-upload-${folder}`}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                disabled || uploading
                  ? 'border-primary/10 bg-secondary/30 cursor-not-allowed'
                  : 'border-primary/30 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <ImageIcon className="h-6 w-6 text-primary/50" />
              <p className="text-[10px] text-muted-foreground mt-1">Add more</p>
            </label>
          )}
        </div>
      )}

      {/* Hint */}
      {images.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          💡 First image is the main image • Hover to set main or remove
        </p>
      )}
    </div>
  );
}