'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  ArrowRight,
  Loader2,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.getMyOrder(orderId);
        setOrder(data);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-xl">
      {/* Success Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 border border-primary/10 p-5 sm:p-6 text-center">
        {/* Animated checkmark */}
        <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4">
          <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">
          Order <span className="gradient-text">Confirmed</span>!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
          Thank you for your purchase! 🎉
        </p>
        <p className="text-[11px] text-muted-foreground">
          We've sent a confirmation to your Telegram
        </p>
      </div>

      {/* Order Details */}
      <div className="mt-5 rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Order Number
            </p>
            <p className="font-bold text-sm">{order.orderNumber}</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {order.status}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3 pt-4 border-t border-primary/10">
          <Step icon={CheckCircle2} title="Order Placed" active done />
          <Step icon={Package} title="Being Prepared" active={false} />
          <Step icon={Truck} title="Shipped" active={false} />
          <Step icon={Home} title="Delivered" active={false} />
        </div>
      </div>

      {/* Shipping Info */}
      <div className="mt-4 rounded-2xl border border-primary/10 bg-white p-5">
        <h3 className="font-bold text-sm mb-3">Delivery Address</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span>{order.shippingAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>{order.phone}</span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="font-bold text-lg sm:text-xl gradient-text">
              {Number(order.total).toLocaleString()} ETB
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Payment</p>
            <p className="font-bold text-sm">{order.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          asChild
          variant="outline"
          size="default"
          className="rounded-full h-10 sm:h-11 border border-primary/20 hover:border-primary/40 font-semibold text-xs sm:text-sm"
        >
          <Link href="/phones">
            Continue Shopping
          </Link>
        </Button>
        <Button
          asChild
          size="default"
          className="rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
        >
          <Link href="/account/orders">
            Track Order
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Step({ icon: Icon, title, active, done }: any) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          done
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span
        className={`text-sm ${
          done ? 'text-green-600 font-semibold' : 'text-muted-foreground'
        }`}
      >
        {title}
      </span>
    </div>
  );
}