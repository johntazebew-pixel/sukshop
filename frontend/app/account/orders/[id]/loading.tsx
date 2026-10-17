import { Loader2, Package } from 'lucide-react';

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/10 bg-white p-5 animate-pulse">
        <div className="h-4 w-32 bg-secondary rounded mb-3" />
        <div className="h-6 w-48 bg-secondary rounded mb-2" />
        <div className="h-3 w-40 bg-secondary rounded" />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Loading your order...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}