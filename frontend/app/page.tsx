import Link from 'next/link';
import { ArrowRight, Smartphone, Truck, ShieldCheck, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productService, categoryService } from '@/services/product.service';
import { bannerService } from '@/services/banner.service';
import { HeroCarousel } from '@/components/shared/hero-carousel';
import { ProductCard } from '@/components/shared/product-card';
import { CategoryCard } from '@/components/shared/category-card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [banners, featuredProducts, categories] = await Promise.all([
    bannerService.getAll().catch((err) => {
      console.warn('Failed to fetch banners on HomePage:', err?.message || err);
      return [];
    }),
    productService.getAll({ featured: true }).catch((err) => {
      console.warn('Failed to fetch featured products on HomePage:', err?.message || err);
      return [];
    }),
    categoryService.getAll().catch((err) => {
      console.warn('Failed to fetch categories on HomePage:', err?.message || err);
      return [];
    }),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <HeroCarousel banners={banners} />

      {/* Features Bar */}
      <section className="py-6 sm:py-8 relative bg-secondary/25 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Feature icon={Truck} title="Fast Delivery" desc="Addis Ababa in 24h" />
            <Feature icon={ShieldCheck} title="100% Authentic" desc="Genuine products" />
            <Feature icon={Headphones} title="24/7 Support" desc="Always here to help" />
            <Feature icon={Smartphone} title="Best Prices" desc="Direct from source" />
          </div>
        </div>
      </section>

      {/* Categories / Brands */}
      {categories.length > 0 && (
        <section className="py-10 sm:py-14 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

          <div className="relative container mx-auto px-4">
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <div>
                <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
                  Browse
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Shop by <span className="gradient-text">Brand</span>
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Choose from the leading smartphone brands
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm text-muted-foreground hover:text-primary">
                <Link href="/phones">
                  All Brands <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-10 sm:py-14 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
              <div>
                <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
                  Handpicked
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Featured <span className="gradient-text">Phones</span>
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Top devices and best-sellers curated for you
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full px-4 h-9 border border-primary/20 hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm self-start sm:self-auto"
              >
                <Link href="/phones">
                  View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-10 sm:py-14 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl sm:rounded-3xl jade-gradient p-8 sm:p-12 md:p-14 text-center overflow-hidden shadow-xl shadow-primary/20">
            {/* Decorative circles */}
            <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                Ready for your <span className="text-secondary">new phone</span>?
              </h2>
              <p className="text-sm sm:text-base text-white/85 mb-6 max-w-lg mx-auto">
                Free delivery on orders above 50,000 ETB. Cash on Delivery available across Ethiopia.
              </p>
              <Button
                asChild
                size="default"
                className="rounded-full px-7 h-11 bg-white text-primary hover:bg-secondary font-semibold text-sm sm:text-base shadow-lg hover:scale-105 transition-transform"
              >
                <Link href="/phones">
                  Browse All Phones <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-primary/10 hover:border-primary/25 transition-all duration-300 hover:shadow-xs overflow-hidden">
      <div className="relative shrink-0">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="relative min-w-0">
        <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">{title}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </div>
  );
}