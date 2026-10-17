import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-secondary to-primary/20 flex items-center justify-center">
          <Package className="h-12 w-12 text-primary" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Order not found</h1>
      <p className="text-sm text-muted-foreground mb-6">
        This order doesn&apos;t exist or you don&apos;t have access to it.
      </p>

      <Button asChild className="rounded-full">
        <Link href="/account/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>
    </div>
  );
}