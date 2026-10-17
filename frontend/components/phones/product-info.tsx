'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Share2,
  Check,
  Truck,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const { setItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setLoading(true);
    try {
      await cartService.addToCart(product.id, quantity);
      const cart = await cartService.getCart();
      setItemCount(cart.itemCount);
      toast.success('Added to cart', {
        description: `${quantity} × ${product.name}`,
      });
    } catch (error: any) {
      toast.error('Failed to add to cart', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;

    if (!isAuthenticated) {
      toast.info('Please sign in to continue');
      router.push('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    try {
      await cartService.addToCart(product.id, quantity);
      router.push('/cart');
    } catch (error: any) {
      toast.error('Failed', {
        description: error.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = () => {
    setWishlist(!wishlist);
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.isFeatured && (
          <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1">
            ⭐ Featured
          </Badge>
        )}
        {discount > 0 && (
          <Badge className="bg-accent text-white rounded-full px-3 py-1">
            -{discount}% OFF
          </Badge>
        )}
        {isOutOfStock ? (
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Out of Stock
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700 rounded-full px-3 py-1 border border-green-200">
            ✓ In Stock ({product.stock})
          </Badge>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 leading-tight">
          {product.name}
        </h1>
        {product.nameAm && (
          <p className="text-sm sm:text-base text-muted-foreground">{product.nameAm}</p>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < 4
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">(4.5)</span>
        <span className="text-xs text-muted-foreground">• 12 reviews</span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 pb-4 border-b border-primary/10">
        <span className="text-2xl sm:text-3xl font-bold gradient-text">
          {price.toLocaleString()}
        </span>
        <span className="text-sm sm:text-base text-muted-foreground font-medium">ETB</span>
        {oldPrice && (
          <span className="text-sm text-muted-foreground line-through ml-2">
            {oldPrice.toLocaleString()} ETB
          </span>
        )}
      </div>

      {/* Quick Specs */}
      <div className="grid grid-cols-2 gap-2.5">
        {product.storage && (
          <SpecRow label="Storage" value={product.storage} />
        )}
        {product.color && (
          <SpecRow label="Color" value={product.color} />
        )}
        {product.ram && <SpecRow label="RAM" value={product.ram} />}
        {product.screenSize && (
          <SpecRow label="Screen" value={product.screenSize} />
        )}
      </div>

      {/* Quantity + Actions */}
      <div className="space-y-3.5 pt-3.5 border-t border-primary/10">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-medium">Quantity:</span>
          <div className="flex items-center gap-2 border border-primary/20 rounded-full p-0.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(Math.min(product.stock, quantity + 1))
              }
              disabled={quantity >= product.stock}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            variant="outline"
            size="default"
            className="rounded-full h-10 sm:h-11 border border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs sm:text-sm transition-all duration-300"
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            {loading ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={loading || isOutOfStock}
            size="default"
            className="rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
          >
            Buy Now
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 justify-center pt-1">
          <button
            onClick={handleWishlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              wishlist
                ? 'text-accent'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${wishlist ? 'fill-current' : ''}`} />
            {wishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
          <div className="h-3.5 w-px bg-border" />
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-primary transition-all"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Delivery info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs sm:text-sm">Fast Delivery</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              Addis Ababa in 24-48h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs sm:text-sm">Cash on Delivery</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              Pay on receipt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-secondary/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}