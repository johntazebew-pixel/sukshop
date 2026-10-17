'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Stats {
  totalOrders: number;
  byStatus: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    products: 0,
    users: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, usersRes, catsRes, recentRes] =
        await Promise.all([
          api.get('/orders/admin/stats'),
          api.get('/products').catch(() => ({ data: [] })),
          api.get('/users').catch(() => ({ data: [] })),
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/orders/admin/all').catch(() => ({ data: [] })),
        ]);

      setStats(ordersRes.data);
      setCounts({
        products: productsRes.data.length || 0,
        users: usersRes.data.length || 0,
        categories: catsRes.data.length || 0,
      });
      setRecentOrders((recentRes.data || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Store <span className="gradient-text">Overview</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Welcome back! Here's your store overview
        </p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`${Number(stats?.totalRevenue || 0).toLocaleString()} ETB`}
          color="green"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="primary"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={counts.products}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Users"
          value={counts.users}
          color="purple"
        />
      </div>

      {/* Order status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusCard
          icon={Clock}
          label="Pending"
          value={stats?.byStatus.pending || 0}
          color="amber"
          href="/admin/orders?status=PENDING"
        />
        <StatusCard
          icon={CheckCircle2}
          label="Confirmed"
          value={stats?.byStatus.confirmed || 0}
          color="blue"
          href="/admin/orders?status=CONFIRMED"
        />
        <StatusCard
          icon={Truck}
          label="Shipped"
          value={stats?.byStatus.shipped || 0}
          color="indigo"
          href="/admin/orders?status=SHIPPED"
        />
        <StatusCard
          icon={CheckCircle2}
          label="Delivered"
          value={stats?.byStatus.delivered || 0}
          color="green"
          href="/admin/orders?status=DELIVERED"
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <h2 className="font-bold text-base mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            href="/admin/products"
            icon={Package}
            label="Manage Products"
          />
          <QuickAction
            href="/admin/orders"
            icon={ShoppingBag}
            label="View Orders"
          />
          <QuickAction
            href="/admin/users"
            icon={Users}
            label="Manage Users"
          />
          <QuickAction
            href="/admin/settings"
            icon={TrendingUp}
            label="Site Settings"
          />
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No orders yet
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate">
                    {order.orderNumber}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {order.user?.name || 'Customer'} •{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs">
                    {Number(order.total).toLocaleString()} ETB
                  </p>
                  <StatusPill status={order.status} />
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
  const colors: Record<string, string> = {
    primary: 'from-primary/10 to-primary/5 text-primary',
    green: 'from-green-100 to-green-50 text-green-600',
    blue: 'from-blue-100 to-blue-50 text-blue-600',
    purple: 'from-purple-100 to-purple-50 text-purple-600',
  };

  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-4">
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-lg font-bold truncate">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, color, href }: any) {
  const colors: Record<string, string> = {
    amber: 'from-amber-100 to-amber-50 text-amber-600',
    blue: 'from-blue-100 to-blue-50 text-blue-600',
    indigo: 'from-indigo-100 to-indigo-50 text-indigo-600',
    green: 'from-green-100 to-green-50 text-green-600',
  };

  return (
    <Link
      href={href}
      className="rounded-2xl border border-primary/10 bg-white p-4 hover:border-primary/30 transition-all group"
    >
      <div
        className={`h-9 w-9 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label }: any) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 p-4 text-center transition-all"
    >
      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold">{label}</p>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
        styles[status] || 'bg-secondary text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}