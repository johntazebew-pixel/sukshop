'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Cart as CartType } from '@/types';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { CartSummary } from '@/components/cart/cart-summary';
import { EmptyCart } from '@/components/cart/empty-cart';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const { setItemCount } = useCartStore();
  const { isAuthenticated, isHydrated } = useAuthStore();

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
      setItemCount(data.itemCount);
    } catch (error: any) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    loadCart();
  }, [isHydrated]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await cartService.updateItem(itemId, quantity);
      await loadCart();
    } catch (error: any) {
      toast.error('Failed to update', {
        description: error.response?.data?.message,
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await cartService.removeItem(itemId);
      toast.success('Item removed');
      await loadCart();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      toast.success('Cart cleared');
      await loadCart();
    } catch {
      toast.error('Failed to clear');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to continue');
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (!isHydrated || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = Number(cart.total);
  const shippingFee = subtotal >= 50000 ? 0 : 500;
  const total = subtotal + shippingFee;
  const freeShippingRemaining = 50000 - subtotal;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue Shopping
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
              Review Items
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 px-3 text-xs gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Cart
          </Button>
        </div>
      </div>

      {freeShippingRemaining > 0 && (
        <div className="mb-6 p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-secondary to-primary/10 border border-primary/20">
          <p className="text-xs sm:text-sm font-medium">
            🚚 Add{' '}
            <span className="font-bold text-primary">
              {freeShippingRemaining.toLocaleString()} ETB
            </span>{' '}
            more for <span className="font-bold">FREE shipping!</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <CartSummary
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}