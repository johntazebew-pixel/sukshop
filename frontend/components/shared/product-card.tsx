'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Smartphone, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { cartService } from '@/services/cart.service';
import { wishlistService } from '@/services/wishlist.service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(false);
  const { setItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const mainImage =
    product.images?.find((img) => img.isMain) || product.images?.[0];
  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const isOutOfStock = product.stock === 0;

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlist(false);
      return;
    }
    wishlistService
      .check(product.id)
      .then((res) => setWishlist(res.inWishlist))
      .catch(() => {});
  }, [product.id, isAuthenticated]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    setLoading(true);
    try {
      await cartService.addToCart(product.id, 1);
      const cart = await cartService.getCart();
      setItemCount(cart.itemCount);
      toast.success('Added to cart', { description: product.name });
    } catch (error: any) {
      toast.error('Failed to add', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Sign in to save to wishlist');
      router.push('/login');
      return;
    }

    setCheckingWishlist(true);
    try {
      const res = await wishlistService.toggle(product.id);
      setWishlist(res.added);
      toast.success(res.message);
    } catch (error: any) {
      toast.error('Failed to update wishlist', {
        description: error.response?.data?.message,
      });
    } finally {
      setCheckingWishlist(false);
    }
  };

  return (
    <Link href={`/phones/${product.slug}`}>
      <div className="group h-full rounded-2xl overflow-hidden border border-primary/10 bg-white hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square bg-secondary/50 overflow-hidden">
          {mainImage?.url ? (
            <img
              src={getImageUrl(mainImage.url)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Smartphone className="h-16 w-16 text-primary/20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                ★
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 rounded-full bg-foreground/80 text-white text-[10px] font-bold">
                Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={checkingWishlist}
            className={`absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              wishlist
                ? 'bg-accent text-white'
                : 'bg-white/90 backdrop-blur text-foreground hover:bg-white'
            }`}
            aria-label="Wishlist"
          >
            {checkingWishlist ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${wishlist ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-xs line-clamp-2 min-h-[2rem] mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {(product.storage || product.color) && (
            <p className="text-[10px] text-muted-foreground mb-2 truncate">
              {[product.storage, product.color].filter(Boolean).join(' • ')}
            </p>
          )}

          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-sm font-bold gradient-text">
              {price.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">ETB</span>
            {oldPrice && (
              <span className="text-[10px] text-muted-foreground line-through ml-auto">
                {oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            size="sm"
            className="w-full rounded-full h-8 bg-gradient-to-r from-primary to-accent font-semibold text-[11px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-1 h-3 w-3" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}