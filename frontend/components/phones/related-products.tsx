import { Product } from '@/types';
import { ProductCard } from '@/components/shared/product-card';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="py-8 sm:py-10 border-t border-primary/10">
      <div className="mb-6">
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          You May Also Like
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold">
          Related <span className="gradient-text">Phones</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}