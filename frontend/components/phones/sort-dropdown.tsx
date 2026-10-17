'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const options = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
  ];

  const currentLabel =
    options.find((opt) => opt.value === currentSort)?.label || 'Newest First';

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'newest') params.delete('sort');
    else params.set('sort', value);
    router.push(`/phones?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-primary/20 hover:border-primary/40 transition-all duration-300 font-medium text-xs sm:text-sm bg-white/70 backdrop-blur-sm">
          <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
          {currentLabel}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`rounded-lg cursor-pointer py-2 px-3 text-xs sm:text-sm ${
              currentSort === opt.value ? 'bg-primary/10 text-primary font-semibold' : ''
            }`}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}