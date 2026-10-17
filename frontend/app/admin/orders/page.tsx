'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Eye,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Order } from '@/types';
import { toast } from 'sonner';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin/all', {
        params: status ? { status } : {},
      });
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      o.shippingAddress?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Fulfillment
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Customer <span className="gradient-text">Orders</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl text-sm border-primary/15"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                status === s.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white border border-primary/15 text-muted-foreground hover:border-primary/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl mb-1">No orders found</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Try adjusting your filters or search keywords</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/10 bg-white overflow-hidden">
          <div className="divide-y divide-primary/5">
            {filtered.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors group"
              >
                <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs truncate">
                      {order.orderNumber}
                    </p>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {order.user?.name || 'Customer'} • {order.phone}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="font-bold text-sm gradient-text">
                    {Number(order.total).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">ETB</p>
                </div>

                <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
        styles[status] || 'bg-secondary text-muted-foreground'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}