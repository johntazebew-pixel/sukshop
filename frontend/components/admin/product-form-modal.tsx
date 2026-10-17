'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, X, Save, Plus, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ImageUploader } from './image-uploader';

interface ProductFormModalProps {
  product: Product | null;
  categories: any[];
  subcategories: any[];
  onClose: () => void;
  onSave: () => void;
}

export function ProductFormModal({
  product,
  categories,
  subcategories,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const isEditing = !!product;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<number>(
    product?.subcategory?.categoryId || 0,
  );
  const [localSubcategories, setLocalSubcategories] = useState(subcategories);
  const [editingModel, setEditingModel] = useState<any | null>(null);
  const [showModelEditor, setShowModelEditor] = useState(false);
  const [modelForm, setModelForm] = useState({ name: '', nameAm: '', slug: '' });
  const [savingModel, setSavingModel] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || '',
    nameAm: product?.nameAm || '',
    slug: product?.slug || '',
    description: product?.description || '',
    descriptionAm: product?.descriptionAm || '',
    price: product?.price || '',
    oldPrice: product?.oldPrice || '',
    stock: product?.stock || 0,
    sku: product?.sku || '',
    storage: product?.storage || '',
    color: product?.color || '',
    ram: product?.ram || '',
    screenSize: product?.screenSize || '',
    battery: product?.battery || '',
    camera: product?.camera || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    modelName: product?.subcategory?.name || '',
    modelNameAm: product?.subcategory?.nameAm || '',
    modelSlug: product?.subcategory?.slug || '',
    images: product?.images?.map((img: any) => img.url) || ([] as string[]),
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug:
        prev.slug ||
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
    }));
  };

  const handleModelNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      modelName: value,
      modelSlug:
        prev.modelSlug ||
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
    }));
  };

  const handleBrandChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setForm((prev) => ({
      ...prev,
      modelName: '',
      modelNameAm: '',
      modelSlug: '',
    }));
  };

  // ==========================================
  // Model Editor Functions
  // ==========================================
  const openModelEditor = (model: any = null) => {
    setEditingModel(model);
    if (model) {
      setModelForm({
        name: model.name,
        nameAm: model.nameAm,
        slug: model.slug,
      });
    } else {
      setModelForm({
        name: form.modelName || '',
        nameAm: form.modelNameAm || '',
        slug: form.modelSlug || '',
      });
    }
    setShowModelEditor(true);
  };

  const handleSaveModel = async () => {
    if (!modelForm.name.trim() || !modelForm.nameAm.trim()) {
      toast.error('Name (English + Amharic) required');
      return;
    }

    setSavingModel(true);
    try {
      const slug =
        modelForm.slug ||
        modelForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const payload = {
        name: modelForm.name,
        nameAm: modelForm.nameAm,
        slug,
        categoryId: selectedCategory,
      };

      if (editingModel) {
        const res = await api.patch(
          `/subcategories/${editingModel.id}`,
          payload,
        );
        setLocalSubcategories((prev) =>
          prev.map((s) => (s.id === editingModel.id ? res.data : s)),
        );
        toast.success('Model updated ✅');
      } else {
        const res = await api.post('/subcategories', payload);
        setLocalSubcategories((prev) => [...prev, res.data]);
        toast.success('Model created ✅');
      }

      // Update form
      setForm((prev) => ({
        ...prev,
        modelName: modelForm.name,
        modelNameAm: modelForm.nameAm,
        modelSlug: slug,
      }));

      setShowModelEditor(false);
      setEditingModel(null);
      setModelForm({ name: '', nameAm: '', slug: '' });
    } catch (error: any) {
      toast.error('Save failed', {
        description: error.response?.data?.message || 'Try again',
      });
    } finally {
      setSavingModel(false);
    }
  };

  const handleDeleteModel = async (model: any) => {
    if (!confirm(`Delete model "${model.name}"? Products will be affected.`))
      return;

    try {
      await api.delete(`/subcategories/${model.id}`);
      setLocalSubcategories((prev) => prev.filter((s) => s.id !== model.id));
      toast.success('Model deleted');
    } catch (error: any) {
      toast.error('Delete failed', {
        description: error.response?.data?.message,
      });
    }
  };

  // ==========================================
  // Find or create model by name
  // ==========================================
  const findOrCreateModel = async (): Promise<number> => {
    const trimmed = form.modelName.trim();
    const trimmedAm = form.modelNameAm.trim() || trimmed;
    const slug =
      form.modelSlug.trim() ||
      trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    if (!trimmed) throw new Error('Model name required');

    const existing = localSubcategories.find(
      (s) =>
        s.categoryId === selectedCategory &&
        (s.name.toLowerCase() === trimmed.toLowerCase() || s.slug === slug),
    );

    if (existing) return existing.id;

    const res = await api.post('/subcategories', {
      name: trimmed,
      nameAm: trimmedAm,
      slug,
      categoryId: selectedCategory,
      isActive: true,
    });
    toast.success(`Model "${trimmed}" created ✅`);
    setLocalSubcategories((prev) => [...prev, res.data]);
    return res.data.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name required';
    if (!form.nameAm.trim()) newErrors.nameAm = 'Amharic name required';
    if (!form.slug.trim()) newErrors.slug = 'Slug required';
    if (!form.price) newErrors.price = 'Price required';
    if (!form.sku.trim()) newErrors.sku = 'SKU required';
    if (!selectedCategory) newErrors.category = 'Select a brand';
    if (selectedCategory && !form.modelName.trim())
      newErrors.modelName = 'Model required';
    if (!form.description.trim()) newErrors.description = 'Description required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors');
      return;
    }

    setSaving(true);
    try {
      const subcategoryId = await findOrCreateModel();

      const payload: any = {
        name: form.name,
        nameAm: form.nameAm,
        slug: form.slug,
        description: form.description,
        descriptionAm: form.descriptionAm || form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        sku: form.sku,
        subcategoryId,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        images: form.images,
      };

      if (form.oldPrice) payload.oldPrice = Number(form.oldPrice);
      if (form.storage) payload.storage = form.storage;
      if (form.color) payload.color = form.color;
      if (form.ram) payload.ram = form.ram;
      if (form.screenSize) payload.screenSize = form.screenSize;
      if (form.battery) payload.battery = form.battery;
      if (form.camera) payload.camera = form.camera;

      if (isEditing) {
        await api.patch(`/products/${product.id}`, payload);
        toast.success('Product updated ✅');
      } else {
        await api.post('/products', payload);
        toast.success('Product created ✅');
      }

      onSave();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      const displayMsg = Array.isArray(msg) ? msg[0] : msg || 'Save failed';
      toast.error('Save failed', { description: displayMsg });
      setErrors({ general: displayMsg });
    } finally {
      setSaving(false);
    }
  };

  const existingModels = localSubcategories.filter(
    (s) => s.categoryId === selectedCategory,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-primary/10 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEditing ? product.name : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-secondary flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* ==========================================
              STEP 1: BRAND
              ========================================== */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 border-2 border-primary/15">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                1
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-wide">
                Select Brand
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleBrandChange(c.id)}
                  disabled={saving}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    selectedCategory === c.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : 'bg-white border-primary/15 text-foreground hover:border-primary/40'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedCategory === c.id
                        ? 'bg-white/20'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {c.name.charAt(0)}
                  </div>
                  {c.name}
                </button>
              ))}
            </div>

            {errors.category && (
              <p className="text-destructive text-[11px] mt-2">
                {errors.category}
              </p>
            )}

            {selectedCategory > 0 && (
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-primary font-semibold">
                <ChevronRight className="h-3 w-3" />
                Brand selected
              </div>
            )}
          </div>

          {/* ==========================================
              STEP 2: MODEL
              ========================================== */}
          {selectedCategory > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 border-2 border-primary/15 space-y-3 animate-fade-in-up">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    2
                  </div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wide">
                    Select or Create Model
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openModelEditor()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  New Model
                </button>
              </div>

              {/* Model Name */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Model (English) *
                </Label>
                <Input
                  value={form.modelName}
                  onChange={(e) => handleModelNameChange(e.target.value)}
                  placeholder="Type model name, e.g., iPhone 15 Pro"
                  disabled={saving}
                  className={`h-11 rounded-xl text-sm ${
                    errors.modelName
                      ? 'border-destructive'
                      : 'border-primary/15 focus:border-primary'
                  }`}
                  autoFocus
                />
                {errors.modelName && (
                  <p className="text-destructive text-[11px] mt-1">
                    {errors.modelName}
                  </p>
                )}
              </div>

              {/* Amharic + Slug */}
              {form.modelName && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up">
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">
                      ሞዴል (Amharic)
                    </Label>
                    <Input
                      value={form.modelNameAm}
                      onChange={(e) =>
                        handleChange('modelNameAm', e.target.value)
                      }
                      placeholder="አይፎን 15 ፕሮ"
                      disabled={saving}
                      className="h-11 rounded-xl text-sm border-primary/15"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">
                      Slug
                    </Label>
                    <Input
                      value={form.modelSlug}
                      onChange={(e) =>
                        handleChange('modelSlug', e.target.value)
                      }
                      placeholder="iphone-15-pro"
                      disabled={saving}
                      className="h-11 rounded-xl text-sm border-primary/15 bg-white/70"
                    />
                  </div>
                </div>
              )}

              {/* Existing models */}
              {existingModels.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-2 font-semibold">
                    Existing models (click to select / edit):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {existingModels.map((s) => (
                      <div
                        key={s.id}
                        className={`group inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          form.modelName === s.name
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white border border-primary/15 text-muted-foreground hover:border-primary'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              modelName: s.name,
                              modelNameAm: s.nameAm,
                              modelSlug: s.slug,
                            }))
                          }
                          className="truncate"
                        >
                          {s.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => openModelEditor(s)}
                          className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors ${
                            form.modelName === s.name
                              ? 'hover:bg-white/20'
                              : 'hover:bg-primary/20 hover:text-primary'
                          }`}
                          title="Edit model"
                        >
                          <Edit3 className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModel(s)}
                          className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors ${
                            form.modelName === s.name
                              ? 'hover:bg-white/20'
                              : 'hover:bg-destructive/20 hover:text-destructive'
                          }`}
                          title="Delete model"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              STEP 3: PRODUCT DETAILS
              ========================================== */}
          {selectedCategory > 0 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                  3
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide">
                  Product Details
                </p>
              </div>

              {/* Images Section — NEW */}
{/* Images Section */}
<div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 border-2 border-primary/15 space-y-3">
  <Label className="text-xs font-bold text-primary mb-2 block">
    Product Images
  </Label>

  <ImageUploader
    images={form.images}
    onChange={(images) => handleChange('images', images)}
    maxImages={5}
    folder="products"
    disabled={saving}
  />

  {/* 🆕 Paste Public URL */}
  <div className="pt-3 border-t border-primary/10">
    <Label className="text-xs font-semibold mb-1.5 block">
      OR paste public image URL (works for Telegram notifications)
    </Label>
    <div className="flex gap-2">
      <Input
        id="public-image-url"
        placeholder="https://images.unsplash.com/..."
        className="h-10 rounded-xl text-sm border-primary/15 flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.currentTarget;
            const url = input.value.trim();
            if (url && url.startsWith('http')) {
              handleChange('images', [...form.images, url]);
              input.value = '';
            } else {
              toast.error('Please enter a valid https:// URL');
            }
          }
        }}
      />
      <Button
        type="button"
        onClick={() => {
          const input = document.getElementById(
            'public-image-url',
          ) as HTMLInputElement;
          const url = input?.value.trim();
          if (url && url.startsWith('http')) {
            handleChange('images', [...form.images, url]);
            input.value = '';
          } else {
            toast.error('Please enter a valid https:// URL');
          }
        }}
        className="rounded-xl h-10 px-4 bg-primary text-white text-xs font-semibold"
      >
        Add URL
      </Button>
    </div>
    <p className="text-[10px] text-muted-foreground mt-1">
      ⚠️ Use https:// URLs (not localhost) so Telegram can fetch them
    </p>
  </div>
</div>

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Product Name (English) *
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="iPhone 15 Pro Max 256GB Black"
                    disabled={saving}
                    className={`h-10 rounded-xl text-sm ${
                      errors.name ? 'border-destructive' : 'border-primary/15'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-destructive text-[10px] mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    ስም (Amharic) *
                  </Label>
                  <Input
                    value={form.nameAm}
                    onChange={(e) => handleChange('nameAm', e.target.value)}
                    placeholder="አይፎን 15 ፕሮ ማክስ 256GB ጥቁር"
                    disabled={saving}
                    className={`h-10 rounded-xl text-sm ${
                      errors.nameAm ? 'border-destructive' : 'border-primary/15'
                    }`}
                  />
                  {errors.nameAm && (
                    <p className="text-destructive text-[10px] mt-1">
                      {errors.nameAm}
                    </p>
                  )}
                </div>
              </div>

              {/* Slug */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Slug (URL) *
                </Label>
                <Input
                  value={form.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="iphone-15-pro-max-256gb-black"
                  disabled={saving}
                  className={`h-10 rounded-xl text-sm ${
                    errors.slug ? 'border-destructive' : 'border-primary/15'
                  }`}
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Price (ETB) *
                  </Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="95000"
                    disabled={saving}
                    className={`h-10 rounded-xl text-sm ${
                      errors.price ? 'border-destructive' : 'border-primary/15'
                    }`}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Old Price
                  </Label>
                  <Input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => handleChange('oldPrice', e.target.value)}
                    placeholder="105000"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
              </div>

              {/* Stock + SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Stock *
                  </Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    SKU *
                  </Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="IP15PM-256-BLK"
                    disabled={saving}
                    className={`h-10 rounded-xl text-sm ${
                      errors.sku ? 'border-destructive' : 'border-primary/15'
                    }`}
                  />
                </div>
              </div>

              {/* Variants */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Storage
                  </Label>
                  <Input
                    value={form.storage}
                    onChange={(e) => handleChange('storage', e.target.value)}
                    placeholder="256GB"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Color
                  </Label>
                  <Input
                    value={form.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="Black"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    RAM
                  </Label>
                  <Input
                    value={form.ram}
                    onChange={(e) => handleChange('ram', e.target.value)}
                    placeholder="8GB"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Screen
                  </Label>
                  <Input
                    value={form.screenSize}
                    onChange={(e) => handleChange('screenSize', e.target.value)}
                    placeholder="6.7 inch"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Battery
                  </Label>
                  <Input
                    value={form.battery}
                    onChange={(e) => handleChange('battery', e.target.value)}
                    placeholder="4441 mAh"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Camera
                  </Label>
                  <Input
                    value={form.camera}
                    onChange={(e) => handleChange('camera', e.target.value)}
                    placeholder="48MP"
                    disabled={saving}
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Description (English) *
                </Label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Full description..."
                  rows={3}
                  disabled={saving}
                  className={`w-full px-3 py-2 rounded-xl text-sm border bg-transparent resize-none focus:outline-none ${
                    errors.description
                      ? 'border-destructive'
                      : 'border-primary/15 focus:border-primary'
                  }`}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Description (Amharic)
                </Label>
                <textarea
                  value={form.descriptionAm}
                  onChange={(e) =>
                    handleChange('descriptionAm', e.target.value)
                  }
                  placeholder="ሙሉ መግለጫ..."
                  rows={3}
                  disabled={saving}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-primary/15 bg-transparent resize-none focus:outline-none focus:border-primary"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="h-4 w-4 accent-[oklch(0.55_0.15_155)]"
                  />
                  <span className="text-xs font-semibold">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      handleChange('isFeatured', e.target.checked)
                    }
                    className="h-4 w-4 accent-[oklch(0.55_0.15_155)]"
                  />
                  <span className="text-xs font-semibold">Featured</span>
                </label>
              </div>
            </div>
          )}

          {/* Empty state */}
          {selectedCategory === 0 && (
            <div className="p-8 rounded-2xl border-2 border-dashed border-primary/20 text-center">
              <Plus className="h-8 w-8 text-primary/40 mx-auto mb-2" />
              <p className="text-sm font-semibold">Select a brand to continue</p>
            </div>
          )}

          {/* Error */}
          {errors.general && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-xs">{errors.general}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white py-3 -mx-5 px-5 border-t border-primary/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl h-11 border-2 border-primary/20 font-semibold text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || selectedCategory === 0}
              className="flex-1 rounded-xl h-11 bg-gradient-to-r from-primary to-accent font-semibold text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ==========================================
          MODEL EDITOR MODAL
          ========================================== */}
      {showModelEditor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-primary/10">
              <h3 className="text-base font-bold">
                {editingModel ? 'Edit Model' : 'Create New Model'}
              </h3>
              <button
                onClick={() => {
                  setShowModelEditor(false);
                  setEditingModel(null);
                }}
                className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Model Name (English) *
                </Label>
                <Input
                  value={modelForm.name}
                  onChange={(e) =>
                    setModelForm({
                      ...modelForm,
                      name: e.target.value,
                      slug:
                        modelForm.slug ||
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                    })
                  }
                  placeholder="iPhone 15 Pro"
                  className="h-11 rounded-xl text-sm border-primary/15"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  ሞዴል (Amharic) *
                </Label>
                <Input
                  value={modelForm.nameAm}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, nameAm: e.target.value })
                  }
                  placeholder="አይፎን 15 ፕሮ"
                  className="h-11 rounded-xl text-sm border-primary/15"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Slug
                </Label>
                <Input
                  value={modelForm.slug}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, slug: e.target.value })
                  }
                  placeholder="iphone-15-pro"
                  className="h-11 rounded-xl text-sm border-primary/15 bg-secondary/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModelEditor(false);
                    setEditingModel(null);
                  }}
                  disabled={savingModel}
                  className="flex-1 rounded-xl h-11 border-2 border-primary/20 font-semibold text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveModel}
                  disabled={savingModel}
                  className="flex-1 rounded-xl h-11 bg-gradient-to-r from-primary to-accent font-semibold text-sm"
                >
                  {savingModel ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingModel ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}