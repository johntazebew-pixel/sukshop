'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  X,
  Navigation,
  MapPin,
  Calendar,
  Boxes,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

interface TrackedOrder {
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  total: string;
  customerName: string;
  destinationCity: string;
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    imageUrl?: string;
  }>;
  timeline: Array<{
    status: string;
    note?: string;
    date: string;
  }>;
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Please enter a tracking number');
      return;
    }

    if (trimmed.length < 5) {
      toast.error('Tracking number is too short');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    router.replace(`/track?q=${encodeURIComponent(trimmed)}`);

    try {
      const res = await api.get(
        `/orders/track/${encodeURIComponent(trimmed)}`,
      );
      setOrder(res.data);
      toast.success('Order found!');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'No order found with this tracking number';
      setError(message);
      toast.error('Order not found', { description: message });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setOrder(null);
    setError(null);
    setSearched(false);
    router.replace('/track');
  };

  const isCancelled = order?.status === 'CANCELLED';
  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/50 py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back button */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-3 shadow-md shadow-primary/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
              Order Tracking
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Track Your <span className="gradient-text">Order</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Enter your tracking number or order number to see live status
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter tracking or order # (e.g., ORD-202510-12345)"
              className="pl-10 pr-28 h-11 sm:h-12 rounded-2xl text-xs sm:text-sm border border-primary/20 focus:border-primary bg-white shadow-md"
              disabled={loading}
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
              {query && !loading && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                  aria-label="Clear"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-xl h-8 sm:h-9 px-4 bg-gradient-to-r from-primary to-accent font-semibold text-xs sm:text-sm"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Track'
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-primary/10 bg-white p-10 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Looking up your order...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="font-bold text-base mb-2 text-destructive">
              Order Not Found
            </h3>
            <p className="text-sm text-muted-foreground mb-5">{error}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Check your tracking number for typos</p>
              <p>• Try your order number instead</p>
              <p>• Contact support if the issue persists</p>
            </div>
          </div>
        )}

        {/* Order Result */}
        {!loading && order && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Order Number
                  </p>
                  <h2 className="text-xl font-bold">{order.orderNumber}</h2>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Placed {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {isCancelled && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <X className="h-4 w-4" />
                    This order has been cancelled
                  </p>
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-primary/10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Tracking #
                      </p>
                      <p className="text-xs font-bold font-mono mt-0.5">
                        {order.trackingNumber}
                      </p>
                    </div>
                    {order.courierName && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Courier
                        </p>
                        <p className="text-xs font-bold mt-0.5">
                          {order.courierName}
                        </p>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Est. Delivery
                        </p>
                        <p className="text-xs font-bold mt-0.5">
                          {new Date(
                            order.estimatedDelivery,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            {!isCancelled && (
              <div className="rounded-2xl border border-primary/10 bg-white p-6">
                <h3 className="font-bold text-base mb-5">Delivery Progress</h3>
                <div className="space-y-1">
                  {STATUS_STEPS.map((step, index) => {
                    const isComplete = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    const historyEntry = order.timeline.find(
                      (h) => h.status === step.key,
                    );

                    return (
                      <div key={step.key} className="flex items-start gap-3">
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
                              className={`w-0.5 h-12 ${
                                index < currentStepIndex
                                  ? 'bg-green-500'
                                  : 'bg-secondary'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pt-2 pb-3">
                          <p
                            className={`text-sm font-semibold ${
                              isComplete
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {step.label}
                          </p>
                          {historyEntry && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {new Date(historyEntry.date).toLocaleString()}
                              {historyEntry.note &&
                                ` • ${historyEntry.note}`}
                            </p>
                          )}
                          {isCurrent && !historyEntry && (
                            <p className="text-[11px] text-primary font-medium mt-0.5">
                              In progress...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                Items in Package ({order.itemCount})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-semibold">
                    {order.destinationCity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {Number(order.total).toLocaleString()} ETB
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 pt-4 border-t border-primary/10">
                For your security, only limited information is shown publicly.
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={clearSearch}
                variant="outline"
                size="sm"
                className="rounded-full px-5 h-9 sm:h-10 border border-primary/20 hover:border-primary/40 font-semibold text-xs sm:text-sm"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Track Another Order
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !order && !error && !searched && (
          <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Package className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-1">Where is my order?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Enter your tracking number from the shipping confirmation, or
              use your order number.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
              <StepCard
                number="1"
                title="Get your number"
                desc="Check your order confirmation"
              />
              <StepCard
                number="2"
                title="Enter it above"
                desc="Paste in the search box"
              />
              <StepCard
                number="3"
                title="See progress"
                desc="Track live status updates"
              />
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@sukshop.com"
              className="text-primary hover:underline font-medium"
            >
              support@sukshop.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-primary/10">
      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mb-2">
        {number}
      </div>
      <p className="text-xs font-bold mb-0.5">{title}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${
        styles[status] || 'bg-secondary text-muted-foreground'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}