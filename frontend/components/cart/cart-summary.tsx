'use client';

import { ArrowRight, Shield, Truck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  onCheckout: () => void;
}

export function CartSummary({
  subtotal,
  shippingFee,
  total,
  onCheckout,
}: CartSummaryProps) {
  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <div className="rounded-2xl border border-primary/10 bg-white p-5 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold">Order Summary</h2>

        <div className="space-y-2.5 pt-2 border-t border-primary/10">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{subtotal.toLocaleString()} ETB</span>
          </div>

          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-semibold">
              {shippingFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `${shippingFee.toLocaleString()} ETB`
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm sm:text-base pt-3 border-t border-primary/10">
            <span className="font-bold">Total</span>
            <span className="font-bold gradient-text text-lg sm:text-xl">
              {total.toLocaleString()} ETB
            </span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          size="default"
          className="w-full rounded-full h-11 sm:h-12 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
        >
          Proceed to Checkout
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>

        <div className="space-y-2.5 pt-3 border-t border-primary/10">
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span>Secure checkout — your data is safe</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span>Cash on Delivery available</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span>7-day easy return policy</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-secondary/30 p-4">
        <p className="text-[10px] font-semibold mb-2.5 text-muted-foreground uppercase tracking-wide">
          Payment Method
        </p>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs">
            💵
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold">Cash on Delivery</p>
            <p className="text-[11px] text-muted-foreground">Pay when you receive</p>
          </div>
        </div>
      </div>
    </div>
  );
}