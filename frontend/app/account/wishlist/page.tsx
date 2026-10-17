'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Loader2,
  ShoppingBag,
  Trash2,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { wishlistService, WishlistItem } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { setItemCount } = useCartStore();

  const load = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setItems(data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      await wishlistService.remove(productId);
      toast.success('Removed from wishlist');
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await cartService.addToCart(productId, 1);
      const cart = await cartService.getCart();
      setItemCount(cart.itemCount);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error('Failed', {
        description: error.response?.data?.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Saved Items
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          My <span className="gradient-text">Wishlist</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {items.length} item{items.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <Heart className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl mb-1">Your wishlist is empty</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Save your favorite phones for later
          </p>
          <Button asChild size="sm" className="rounded-full px-5 h-9 text-xs sm:text-sm">
            <Link href="/phones">Browse Phones</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {items.map((item) => {
            const mainImage =
              item.product.images?.find((img) => img.isMain) ||
              item.product.images?.[0];
            const price = Number(item.product.price);

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-primary/10 bg-white overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-3 p-3 sm:p-3.5">
                  <Link
                    href={`/phones/${item.product.slug}`}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0"
                  >
                    {mainImage?.url ? (
                      <img
                        src={getImageUrl(mainImage.url)}
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                      <Link
                        href={`/phones/${item.product.slug}`}
                        className="text-xs sm:text-sm font-semibold line-clamp-2 hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs sm:text-sm font-bold gradient-text mt-1">
                        {price.toLocaleString()} ETB
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-primary/10">
                      <Button
                        onClick={() => handleAddToCart(item.productId)}
                        size="sm"
                        className="rounded-full h-8 text-xs px-3 bg-gradient-to-r from-primary to-accent font-semibold"
                      >
                        <ShoppingBag className="mr-1 h-3.5 w-3.5" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => handleRemove(item.productId)}
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 w-8 p-0 border-destructive/20 text-destructive hover:bg-destructive/10"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}