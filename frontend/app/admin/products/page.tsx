'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { ProductFormModal } from '@/components/admin/product-form-modal';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const load = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/subcategories'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSubcategories(subRes.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted ✅');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      toast.error('Failed to delete', {
        description: error.response?.data?.message,
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingProduct(null);
    load();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Store <span className="gradient-text">Products</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in store
          </p>
        </div>
        <Button
          onClick={handleAdd}
          size="default"
          className="rounded-full h-10 px-5 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl text-xs sm:text-sm border-primary/15"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-10 text-center">
          <Package className="h-12 w-12 text-primary/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/10 bg-white overflow-hidden">
          <div className="divide-y divide-primary/5">
            {filtered.map((product) => {
              // ⚠️ FIX: Get main image properly
              const mainImage =
                product.images?.find((img) => img.isMain) ||
                product.images?.[0];
              const price = Number(product.price);
              const lowStock = product.stock < 5 && product.stock > 0;
              const noStock = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors"
                >
                  {/* Image — FIXED */}
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                    {mainImage?.url ? (
                      <img
                        src={getImageUrl(mainImage.url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Smartphone className="h-6 w-6 text-primary/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs line-clamp-1">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        •
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {product.storage} {product.color}
                      </p>
                    </div>
                    {/* Stock badge */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {noStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-bold">
                          <AlertCircle className="h-2.5 w-2.5" />
                          OUT OF STOCK
                        </span>
                      ) : lowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">
                          <AlertCircle className="h-2.5 w-2.5" />
                          LOW: {product.stock}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-sm gradient-text">
                      {price.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">ETB</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                      aria-label="Delete"
                    >
                      {deleting === product.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          subcategories={subcategories}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}