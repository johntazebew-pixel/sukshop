'use client';

import { useState } from 'react';
import { Star, Smartphone, Battery, Camera, Cpu, Monitor } from 'lucide-react';
import { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>(
    'description',
  );

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'specs' as const, label: 'Specifications' },
    { id: 'reviews' as const, label: 'Reviews (12)' },
  ];

  return (
    <div className="mb-16">
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-primary/10 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in-up">
        {activeTab === 'description' && (
          <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed">
            <p>{product.description}</p>
            {product.descriptionAm && (
              <p className="mt-4">{product.descriptionAm}</p>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <SpecItem
              icon={Smartphone}
              label="Storage"
              value={product.storage || 'N/A'}
            />
            <SpecItem
              icon={Cpu}
              label="RAM"
              value={product.ram || 'N/A'}
            />
            <SpecItem
              icon={Monitor}
              label="Screen Size"
              value={product.screenSize || 'N/A'}
            />
            <SpecItem
              icon={Battery}
              label="Battery"
              value={product.battery || 'N/A'}
            />
            <SpecItem
              icon={Camera}
              label="Camera"
              value={product.camera || 'N/A'}
            />
            <SpecItem
              icon={Smartphone}
              label="Color"
              value={product.color || 'N/A'}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span>No reviews yet — be the first to review!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10 bg-white hover:border-primary/25 transition-all">
      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}