import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { Category } from '@/types';
import { getImageUrl } from '@/lib/image-url';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/phones?category=${category.slug}`}>
      <div className="group rounded-2xl overflow-hidden border border-primary/10 bg-white hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square bg-gradient-to-br from-secondary/50 to-secondary flex items-center justify-center overflow-hidden">
          {category.imageUrl ? (
            <img
              src={getImageUrl(category.imageUrl)}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <Smartphone className="h-12 w-12 text-primary/30" />
          )}
        </div>
        <div className="p-3 text-center">
          <h3 className="font-semibold text-sm">{category.name}</h3>
          {category.nameAm && (
            <p className="text-[10px] text-muted-foreground">
              {category.nameAm}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}