import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Package, Shield, Truck, RefreshCw } from 'lucide-react';
import { productService } from '@/services/product.service';
import { ProductGallery } from '@/components/phones/product-gallery';
import { ProductInfo } from '@/components/phones/product-info';
import { ProductTabs } from '@/components/phones/product-tabs';
import { RelatedProducts } from '@/components/phones/related-products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  try {
    const product = await productService.getBySlug(slug);
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) notFound();

  // Related products — same subcategory, different product
  const relatedProducts = await productService
    .getAll({ subcategoryId: product.subcategoryId })
    .then((items) => items.filter((p) => p.id !== product.id).slice(0, 4))
    .catch(() => []);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Phones
        </Link>
      </div>

      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8 sm:mb-10">
        {/* Left: Images */}
        <ProductGallery images={product.images || []} productName={product.name} />

        {/* Right: Info */}
        <ProductInfo product={product} />
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <TrustBadge icon={Truck} title="Fast Delivery" desc="24-48 hours" />
        <TrustBadge icon={Shield} title="1 Year Warranty" desc="Official warranty" />
        <TrustBadge icon={RefreshCw} title="7 Day Return" desc="Easy returns" />
        <TrustBadge icon={Package} title="Free Shipping" desc="Over 50K ETB" />
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <ProductTabs product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
}

function TrustBadge({
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
        <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{title}</h4>
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </div>
  );
}