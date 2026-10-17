'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Loader2, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { StatusBadge } from '../page';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          Order History
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          My <span className="gradient-text">Orders</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl mb-1">No orders yet</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Start shopping to see your orders here
          </p>
          <Button asChild size="sm" className="rounded-full px-5 h-9 text-xs sm:text-sm">
            <Link href="/phones">Browse Phones</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-primary/10 bg-white p-4 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Icon */}
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-xs sm:text-sm truncate">
                      {order.orderNumber}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    {order.items?.length || 0} item
                    {(order.items?.length || 0) !== 1 ? 's' : ''} •{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-xs sm:text-sm gradient-text">
                    {Number(order.total).toLocaleString()} ETB
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {order.paymentMethod}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}