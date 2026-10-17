'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Truck,
  Home,
  Loader2,
  MapPin,
  Phone,
  CreditCard,
  X,
  Clock,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { StatusBadge } from '../../page';
import { toast } from 'sonner';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: CheckCircle2 },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Preparing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderService
      .getMyOrder(Number(params.id))
      .then(setOrder)
      .catch(() => router.push('/account/orders'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(order!.id, 'Cancelled by user');
      toast.success('Order cancelled');
      const updated = await orderService.getMyOrder(order!.id);
      setOrder(updated);
    } catch (error: any) {
      toast.error('Failed to cancel', {
        description: error.response?.data?.message,
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const canCancel =
    order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Order Number
            </p>
            <h1 className="text-xl font-bold">{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {canCancel && (
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            variant="outline"
            size="sm"
            className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/5 text-xs"
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Cancelling...
              </>
            ) : (
              <>
                <X className="mr-1 h-3 w-3" /> Cancel Order
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tracking timeline */}
      {!isCancelled && (
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
          <h2 className="font-bold text-base mb-4">Track Order</h2>

          <div className="space-y-1">
            {STATUS_STEPS.map((step, index) => {
              const isComplete = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;
              const historyEntry = order.statusHistory?.find(
                (h) => h.status === step.key,
              );

              return (
                <div key={step.key} className="flex items-start gap-3">
                  {/* Line + icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse'
                          : isComplete
                          ? 'bg-green-500 text-white'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-10 ${
                          index < currentStepIndex ? 'bg-green-500' : 'bg-secondary'
                        }`}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-1.5 pb-2">
                    <p
                      className={`text-sm font-semibold ${
                        isComplete ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </p>
                    {historyEntry && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(historyEntry.createdAt).toLocaleString()}
                      </p>
                    )}
                    {isCurrent && !historyEntry && (
                      <p className="text-[10px] text-primary font-medium mt-0.5 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        In progress
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-[10px] text-muted-foreground mb-1">
                Tracking Number
              </p>
              <p className="font-bold text-sm">{order.trackingNumber}</p>
              {order.courierName && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  via {order.courierName}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cancelled notice */}
      {isCancelled && (
        <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-sm text-destructive">Order Cancelled</p>
              {order.cancelReason && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.cancelReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <h2 className="font-bold text-base mb-4">
          Items ({order.items?.length || 0})
        </h2>
        <div className="space-y-3">
          {order.items?.map((item) => {
            const mainImage =
              item.product?.images?.find((img) => img.isMain) ||
              item.product?.images?.[0];
            return (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-6 w-6 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-2">
                    {item.productName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Qty: {item.quantity} × {Number(item.price).toLocaleString()} ETB
                  </p>
                </div>
                <p className="font-bold text-xs">
                  {(Number(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between">
          <span className="font-bold text-sm">Total</span>
          <span className="font-bold gradient-text text-base">
            {Number(order.total).toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Shipping + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">Delivery Address</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.shippingAddress}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">{order.phone}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">Payment</h3>
          </div>
          <p className="text-xs">{order.paymentMethod}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Payment on delivery
          </p>
        </div>
      </div>
    </div>
  );
}