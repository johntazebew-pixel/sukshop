import Link from 'next/link';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productService, categoryService } from '@/services/product.service';
import { ProductCard } from '@/components/shared/product-card';
import { Filters } from '@/components/phones/filters';
import { SortDropdown } from '@/components/phones/sort-dropdown';

export const metadata = {
  title: 'All Phones',
  description: 'Browse all iPhones and Samsung phones in Ethiopia',
};

interface PhonesPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    featured?: string;
  }>;
}

export default async function PhonesPage({ searchParams }: PhonesPageProps) {
  const params = await searchParams;

  // Load categories
  const categories = await categoryService.getAll().catch(() => []);

  // Load products with filters
  const products = await productService
    .getAll({
      search: params.search,
      sort: params.sort,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      featured: params.featured === 'true',
    })
    .catch(() => []);

  // Client-side category filter
  const filteredProducts = params.category
    ? products.filter(
        (p) => p.subcategory?.category?.slug === params.category,
      )
    : products;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Active search banner */}
        {params.search && (
          <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm">
              Search results for:{' '}
              <span className="font-bold">"{params.search}"</span>
            </p>
            <Link
              href="/phones"
              className="text-xs text-primary hover:underline font-semibold"
            >
              Clear
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
              Browse Collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">
              All <span className="gradient-text">Phones</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              {filteredProducts.length} phone
              {filteredProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <SortDropdown />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Filters categories={categories} />
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-primary/60" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">No phones found</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                Try adjusting your filters or search keywords
              </p>
              <Button asChild size="sm" className="rounded-full px-5 h-9 text-xs sm:text-sm">
                <Link href="/phones">Clear Filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}