'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  Save,
  CheckCircle2,
  X,
  Clock,
  Navigation,
  Home,
  Send,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Order } from '@/types';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', icon: Clock },
  { value: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { value: 'PROCESSING', label: 'Processing', icon: Package },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
  { value: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    status: '',
    trackingNumber: '',
    courierName: '',
    estimatedDelivery: '',
    note: '',
  });

  const load = async () => {
    try {
      const res = await api.get(`/orders/admin/${params.id}`);
      setOrder(res.data);
      setForm({
        status: res.data.status,
        trackingNumber: res.data.trackingNumber || '',
        courierName: res.data.courierName || '',
        estimatedDelivery: res.data.estimatedDelivery
          ? res.data.estimatedDelivery.split('T')[0]
          : '',
        note: '',
      });
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const payload: any = {
        status: form.status,
        note: form.note || `Status changed to ${form.status}`,
      };
      if (form.trackingNumber) payload.trackingNumber = form.trackingNumber;
      if (form.courierName) payload.courierName = form.courierName;
      if (form.estimatedDelivery)
        payload.estimatedDelivery = form.estimatedDelivery;

      await api.patch(`/orders/admin/${params.id}/status`, payload);
      toast.success('Order updated successfully ✅');
      await load();
    } catch (error: any) {
      toast.error('Failed to update', {
        description: error.response?.data?.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelConfirmed = async () => {
    setCancelling(true);
    try {
      await api.patch(`/orders/admin/${params.id}/status`, {
        status: 'CANCELLED',
        note: 'Order cancelled by admin',
      });
      toast.success('Order cancelled successfully');
      setConfirmOpen(false);
      await load();
    } catch (error: any) {
      toast.error('Failed to cancel order', {
        description: error.response?.data?.message,
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  const canCancel =
    order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push('/admin/orders')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Orders
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Order
            </p>
            <h1 className="text-xl font-bold">{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Total
            </p>
            <p className="text-xl font-bold gradient-text">
              {Number(order.total).toLocaleString()} ETB
            </p>
          </div>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-sm text-destructive">
                Order Cancelled
              </p>
              {order.cancelReason && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.cancelReason}
                </p>
              )}
              {order.cancelledAt && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Cancelled on{' '}
                  {new Date(order.cancelledAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Update Form */}
        <div className="lg:col-span-2 space-y-5">
          {!isCancelled && (
            <div className="rounded-2xl border border-primary/10 bg-white p-5">
              <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Update Shipping Status
              </h2>

              <div className="mb-4">
                <Label className="text-xs font-semibold mb-2 block">
                  Current Status
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = form.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, status: opt.value })
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-white border-primary/15 text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(form.status === 'SHIPPED' ||
                form.status === 'OUT_FOR_DELIVERY' ||
                form.status === 'DELIVERED') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-4 rounded-2xl bg-secondary/30 border border-primary/10">
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">
                      Tracking Number
                    </Label>
                    <Input
                      value={form.trackingNumber}
                      onChange={(e) =>
                        setForm({ ...form, trackingNumber: e.target.value })
                      }
                      placeholder="DHL-987654321"
                      className="h-11 rounded-xl text-sm border-primary/15"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">
                      Courier
                    </Label>
                    <Input
                      value={form.courierName}
                      onChange={(e) =>
                        setForm({ ...form, courierName: e.target.value })
                      }
                      placeholder="DHL, EthioPost..."
                      className="h-11 rounded-xl text-sm border-primary/15"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold mb-1.5 block">
                      Estimated Delivery
                    </Label>
                    <Input
                      type="date"
                      value={form.estimatedDelivery}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          estimatedDelivery: e.target.value,
                        })
                      }
                      className="h-11 rounded-xl text-sm border-primary/15"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <Label className="text-xs font-semibold mb-1.5 block">
                  Note (optional)
                </Label>
                <Input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Added a note about this update..."
                  className="h-11 rounded-xl text-sm border-primary/15"
                />
              </div>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full rounded-xl h-11 bg-gradient-to-r from-primary to-accent font-semibold text-sm"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update & Notify Customer
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                <Send className="h-2.5 w-2.5" />
                Customer will be notified via Telegram
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="rounded-2xl border border-primary/10 bg-white p-5 text-center">
              <Ban className="h-12 w-12 text-destructive/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                This order has been cancelled
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No further status updates are possible
              </p>
            </div>
          )}

          {canCancel && (
            <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-destructive flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Cancel This Order
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This action cannot be undone. The customer will be
                    notified.
                  </p>
                </div>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  disabled={cancelling}
                  className="rounded-xl h-11 bg-destructive hover:bg-destructive/90 text-white font-semibold text-sm px-6 whitespace-nowrap"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <h2 className="font-bold text-base mb-4">
              Items ({order.items?.length || 0})
            </h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => {
                const mainImage =
                  item.product?.images?.find((img: any) => img.isMain) ||
                  item.product?.images?.[0];
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      {mainImage?.url ? (
                        <img
                          src={getImageUrl(mainImage.url)}
                          alt={item.productName}
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
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Qty: {item.quantity} ×{' '}
                        {Number(item.price).toLocaleString()} ETB
                      </p>
                    </div>
                    <p className="font-bold text-xs">
                      {(
                        Number(item.price) * item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Customer Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer
            </h3>
            <p className="text-sm font-semibold">{order.user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {order.user?.email}
            </p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">{order.phone}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Delivery Address
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {order.shippingAddress}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment
            </h3>
            <p className="text-xs">{order.paymentMethod}</p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white p-5">
            <h3 className="font-bold text-sm mb-3">History</h3>
            <div className="space-y-2">
              {order.statusHistory?.map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      h.status === 'CANCELLED'
                        ? 'bg-destructive'
                        : 'bg-primary'
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-semibold ${
                        h.status === 'CANCELLED' ? 'text-destructive' : ''
                      }`}
                    >
                      {h.status.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Cancel this order?"
        message={`Are you sure you want to cancel order ${order.orderNumber}? The customer will be notified and this action cannot be undone.`}
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep It"
        onConfirm={handleCancelConfirmed}
        onCancel={() => setConfirmOpen(false)}
        isLoading={cancelling}
        variant="danger"
      />
    </div>
  );
}