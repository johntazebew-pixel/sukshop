import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="relative mb-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-primary/60" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">
          Your cart is <span className="gradient-text">empty</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Looks like you haven't added anything yet. Start shopping to fill it up!
        </p>

        <Button
          asChild
          size="default"
          className="rounded-full px-6 h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
        >
          <Link href="/phones">
            Browse Phones
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>

        <div className="mt-8 pt-6 border-t border-primary/10 w-full">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Popular right now</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/phones?category=iphone"
              className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-semibold"
            >
              iPhone
            </Link>
            <Link
              href="/phones?category=samsung"
              className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-semibold"
            >
              Samsung
            </Link>
            <Link
              href="/phones?featured=true"
              className="px-3.5 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-semibold"
            >
              Featured
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}