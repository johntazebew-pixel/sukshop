'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FiltersProps {
  categories: Category[];
}

export function Filters({ categories }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || '',
  );

  const hasFilters = !!(selectedCategory || minPrice || maxPrice);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');

    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    router.push(`/phones?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    router.push('/phones');
  };

  return (
    <div className="space-y-3 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-sm sm:text-base">Filters</h2>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive hover:text-destructive h-7 px-2 text-xs rounded-full"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <Card className="rounded-xl border-primary/10">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs sm:text-sm font-semibold">Brand</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)
              }
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              {cat.name}
              {selectedCategory === cat.slug && (
                <Badge className="ml-1.5 bg-white/20 text-white text-[10px] px-1 py-0">✓</Badge>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Price Filter */}
      <Card className="rounded-xl border-primary/10">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs sm:text-sm font-semibold">Price (ETB)</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-[10px] text-muted-foreground">
                Min
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-8 text-xs rounded-lg mt-0.5"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-[10px] text-muted-foreground">
                Max
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="200000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-8 text-xs rounded-lg mt-0.5"
              />
            </div>
          </div>

          {/* Quick ranges */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              { label: 'Under 50K', min: '', max: '50000' },
              { label: '50K-100K', min: '50000', max: '100000' },
              { label: 'Over 100K', min: '100000', max: '' },
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  setMinPrice(range.min);
                  setMaxPrice(range.max);
                }}
                className="px-2.5 py-1 text-[11px] rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apply Button */}
      <Button
        onClick={applyFilters}
        size="sm"
        className="w-full rounded-full h-9 text-xs sm:text-sm bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold"
      >
        Apply Filters
      </Button>
    </div>
  );
}