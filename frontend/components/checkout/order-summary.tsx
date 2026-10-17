'use client';

import Link from 'next/link';
import { Smartphone, Shield, Truck } from 'lucide-react';
import { Cart } from '@/types';
import { getImageUrl } from '@/lib/image-url';

interface OrderSummaryProps {
  cart: Cart;
  subtotal: number;
  shippingFee: number;
  total: number;
}

export function OrderSummary({ cart, subtotal, shippingFee, total }: OrderSummaryProps) {
  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <h2 className="font-bold text-base mb-4">Order Summary</h2>

        <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar mb-4 pb-4 border-b border-primary/10">
          {cart.items.map((item) => {
            const mainImage =
              item.product.images?.find((img) => img.isMain) ||
              item.product.images?.[0];
            const price = Number(item.product.price);
            const lineTotal = price * item.quantity;

            return (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  {mainImage?.url ? (
                    <img
                      src={getImageUrl(mainImage.url)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Smartphone className="h-6 w-6 text-primary/30" />
                    </div>
                  )}
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/phones/${item.product.slug}`}
                    className="text-xs font-semibold line-clamp-2 hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {(item.product.storage || item.product.color) && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {[item.product.storage, item.product.color].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold">{lineTotal.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">ETB</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{subtotal.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-semibold">
              {shippingFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `${shippingFee.toLocaleString()} ETB`
              )}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-primary/10">
            <span className="font-bold text-sm">Total</span>
            <span className="font-bold gradient-text text-base">
              {total.toLocaleString()} ETB
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary/10 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span>Fast delivery in 24-48h</span>
          </div>
        </div>
      </div>
    </div>
  );
}