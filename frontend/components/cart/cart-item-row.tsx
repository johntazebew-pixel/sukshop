'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Trash2, Minus, Plus, Smartphone, Loader2 } from 'lucide-react';
import { CartItem } from '@/types';
import { getImageUrl } from '@/lib/image-url';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const mainImage =
    item.product.images?.find((img) => img.isMain) || item.product.images?.[0];
  const price = Number(item.product.price);
  const lineTotal = price * item.quantity;
  const isMaxStock = item.quantity >= item.product.stock;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return;
    setUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setUpdating(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.id);
    setRemoving(false);
  };

  return (
    <div className="group relative flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-primary/10 bg-white hover:border-primary/30 transition-all duration-300">
      <Link
        href={`/phones/${item.product.slug}`}
        className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary flex-shrink-0"
      >
        {mainImage?.url ? (
          <img
            src={getImageUrl(mainImage.url)}
            alt={item.product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary/30" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/phones/${item.product.slug}`}>
              <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 hover:text-primary transition-colors">
                {item.product.name}
              </h3>
            </Link>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex items-center justify-center flex-shrink-0 transition-colors"
              aria-label="Remove item"
            >
              {removing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {(item.product.storage || item.product.color) && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {[item.product.storage, item.product.color].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 mt-2">
          <div className="flex items-center gap-1.5 border border-primary/20 rounded-full p-0.5">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
              className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center font-bold text-xs">
              {updating ? <Loader2 className="h-3 w-3 animate-spin inline" /> : item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isMaxStock || updating}
              className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm sm:text-base font-bold gradient-text">
              {lineTotal.toLocaleString()} ETB
            </p>
            <p className="text-[10px] text-muted-foreground">
              {price.toLocaleString()} ETB each
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}