'use client';

import { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Building2,
  FileText,
  Loader2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShippingData } from '@/app/checkout/page';
import { toast } from 'sonner';

interface ShippingFormProps {
  defaultValues: {
    fullName: string;
    phone: string;
  };
  onSubmit: (data: ShippingData) => Promise<void>;
  loading: boolean;
}

export function ShippingForm({
  defaultValues,
  onSubmit,
  loading,
}: ShippingFormProps) {
  const [form, setForm] = useState<ShippingData>({
    fullName: defaultValues.fullName,
    phone: defaultValues.phone,
    city: '',
    street: '',
    postalCode: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ShippingData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Name required';
    else if (form.fullName.length < 2) newErrors.fullName = 'Min 2 chars';

    if (!form.phone.trim()) newErrors.phone = 'Phone required';
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone))
      newErrors.phone = 'Invalid phone';

    if (!form.city.trim()) newErrors.city = 'City required';
    if (!form.street.trim()) newErrors.street = 'Street required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors');
      return;
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Shipping Address */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="font-bold text-sm sm:text-base">Shipping Address</h2>
        </div>

        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`pl-10 h-11 rounded-xl text-sm ${
                  errors.fullName
                    ? 'border-destructive'
                    : 'border-primary/15 focus:border-primary'
                }`}
                disabled={loading}
              />
            </div>
            {errors.fullName && (
              <p className="text-destructive text-[11px] mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+251 911 223 344"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`pl-10 h-11 rounded-xl text-sm ${
                  errors.phone
                    ? 'border-destructive'
                    : 'border-primary/15 focus:border-primary'
                }`}
                disabled={loading}
              />
            </div>
            {errors.phone && (
              <p className="text-destructive text-[11px] mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* City + Postal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                City *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Addis Ababa"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`pl-10 h-11 rounded-xl text-sm ${
                    errors.city
                      ? 'border-destructive'
                      : 'border-primary/15 focus:border-primary'
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.city && (
                <p className="text-destructive text-[11px] mt-1">
                  {errors.city}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                Postal Code
              </Label>
              <Input
                placeholder="1000"
                value={form.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                className="h-11 rounded-xl text-sm border-primary/15 focus:border-primary"
                disabled={loading}
              />
            </div>
          </div>

          {/* Street */}
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Street Address *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                placeholder="Bole Road, House 123, Apartment 4B"
                value={form.street}
                onChange={(e) => handleChange('street', e.target.value)}
                rows={2}
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border bg-transparent resize-none focus:outline-none focus:ring-0 ${
                  errors.street
                    ? 'border-destructive'
                    : 'border-primary/15 focus:border-primary'
                }`}
                disabled={loading}
              />
            </div>
            {errors.street && (
              <p className="text-destructive text-[11px] mt-1">
                {errors.street}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Order Notes{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                placeholder="Please call before delivery..."
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm border border-primary/15 focus:border-primary bg-transparent resize-none focus:outline-none focus:ring-0"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="font-bold text-sm sm:text-base">Payment Method</h2>
        </div>

        <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">
              💵
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">
                Pay in cash when your order arrives
              </p>
            </div>
            <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        size="default"
        className="w-full rounded-full h-11 sm:h-12 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            Place Order
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-[11px] text-center text-muted-foreground">
        By placing this order, you agree to our{' '}
        <span className="text-primary font-medium">Terms of Service</span>
      </p>
    </form>
  );
}