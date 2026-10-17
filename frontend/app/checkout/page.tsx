'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { Cart } from '@/types';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { toast } from 'sonner';

export interface ShippingData {
  fullName: string;
  phone: string;
  city: string;
  street: string;
  postalCode?: string;
  notes?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const { setItemCount } = useCartStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    loadCart();
  }, [isHydrated, isAuthenticated, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();

      if (!data || data.items.length === 0) {
        toast.error('Your cart is empty');
        router.push('/cart');
        return;
      }

      setCart(data);
    } catch {
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (shipping: ShippingData) => {
    if (!cart) return;
    setPlacing(true);

    try {
      const order = await orderService.createOrder(shipping);
      setItemCount(0);
      toast.success('Order placed successfully! 🎉');
      router.push(`/order-success/${order.id}`);
    } catch (error: any) {
      toast.error('Failed to place order', {
        description: error.response?.data?.message || 'Please try again',
      });
      setPlacing(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = Number(cart.total);
  const shippingFee = subtotal >= 50000 ? 0 : 500;
  const total = subtotal + shippingFee;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Cart
        </Link>
        <div>
          <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
            Order Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Complete Your <span className="gradient-text">Order</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Please provide your delivery information below
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ShippingForm
            defaultValues={{
              fullName: user?.name || '',
              phone: user?.phone || '',
            }}
            onSubmit={handlePlaceOrder}
            loading={placing}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}