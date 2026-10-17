'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Heart,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth-store';
import { Order } from '@/types';

export default function AccountDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Welcome header */}
      <div className="rounded-2xl jade-gradient p-5 sm:p-6 text-white overflow-hidden relative">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <span className="inline-block text-white/90 font-bold text-[10px] uppercase tracking-widest mb-1.5 px-2.5 py-0.5 rounded-full bg-white/20">
            Account Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{user?.name}</h1>
          <p className="text-xs sm:text-sm text-white/80">
            Here's what's happening with your account
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Orders" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={Truck} label="Shipped" value={stats.shipped} color="blue" />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={stats.delivered}
          color="green"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickLink
          href="/account/orders"
          icon={Package}
          label="View All Orders"
          desc="Track your purchases"
        />
        <QuickLink
          href="/account/wishlist"
          icon={Heart}
          label="My Wishlist"
          desc="Saved phones"
        />
        <QuickLink
          href="/account/notifications"
          icon={Bell}
          label="Notifications"
          desc="Telegram & alerts"
        />
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm sm:text-base">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              You haven't placed any orders yet
            </p>
            <Link
              href="/phones"
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:shadow-md transition-all"
            >
              Start Shopping <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate">
                    {order.orderNumber}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs">
                    {Number(order.total).toLocaleString()} ETB
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 text-primary',
    amber: 'from-amber-100 to-amber-50 text-amber-600',
    blue: 'from-blue-100 to-blue-50 text-blue-600',
    green: 'from-green-100 to-green-50 text-green-600',
  }[color as string];

  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-4">
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClasses} flex items-center justify-center mb-3`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: any;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-primary/10 bg-white p-4 hover:border-primary/30 transition-all"
    >
      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-semibold text-sm mb-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
    SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    DELIVERED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
        styles[status] || 'bg-secondary text-muted-foreground'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}