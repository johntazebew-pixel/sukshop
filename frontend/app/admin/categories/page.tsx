'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Tags,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  X,
  Save,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { uploadService } from '@/services/upload.service';
import { Category } from '@/types';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    nameAm: '',
    slug: '',
    imageUrl: '',
    description: '',
  });

  const load = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', nameAm: '', slug: '', imageUrl: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      nameAm: cat.nameAm,
      slug: cat.slug,
      imageUrl: cat.imageUrl || '',
      description: cat.description || '',
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'categories');
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success('Image uploaded ✅');
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.response?.data?.message || 'Try again',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nameAm.trim() || !form.slug.trim()) {
      toast.error('Name (EN + AM) and slug required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        nameAm: form.nameAm,
        slug: form.slug,
      };
      if (form.imageUrl) payload.imageUrl = form.imageUrl;
      if (form.description) payload.description = form.description;

      if (editing) {
        await api.patch(`/categories/${editing.id}`, payload);
        toast.success('Category updated ✅');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created ✅');
      }
      setModalOpen(false);
      load();
    } catch (error: any) {
      toast.error('Save failed', {
        description: error.response?.data?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Products will also be affected.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      toast.error('Failed to delete', {
        description: error.response?.data?.message,
      });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
            Catalog Taxonomy
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Store <span className="gradient-text">Categories</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Button
          onClick={openAdd}
          size="default"
          className="rounded-full h-10 px-5 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl text-xs sm:text-sm border-primary/15"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <Tags className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl mb-1">No categories yet</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Create your first category above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-primary/10 bg-white overflow-hidden hover:border-primary/30 transition-all group"
            >
              {/* Image */}
              <div className="relative aspect-[2/1] bg-gradient-to-br from-secondary to-primary/10 flex items-center justify-center overflow-hidden">
                {cat.imageUrl ? (
                  <img
                    src={getImageUrl(cat.imageUrl)}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-primary/30">
                    {cat.name.charAt(0)}
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="h-9 w-9 rounded-full bg-white hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleting === cat.id}
                    className="h-9 w-9 rounded-full bg-white hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    {deleting === cat.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {cat.nameAm} • /{cat.slug}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {cat.subcategories?.length || 0} models
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-primary/10 bg-white">
              <h2 className="text-lg font-bold">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="h-9 w-9 rounded-full hover:bg-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Image Upload */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 border-2 border-primary/15">
                <Label className="text-xs font-bold text-primary mb-3 block">
                  Category Image
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading || saving}
                  className="hidden"
                  id="category-image-input"
                />

                {form.imageUrl ? (
                  <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-secondary group">
                    <img
                      src={getImageUrl(form.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="category-image-input"
                        className="h-9 px-3 rounded-full bg-white hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Upload className="h-3 w-3" />
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, imageUrl: '' }))
                        }
                        className="h-9 w-9 rounded-full bg-white hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="category-image-input"
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      uploading || saving
                        ? 'border-primary/10 bg-secondary/30 cursor-not-allowed'
                        : 'border-primary/30 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        <p className="text-xs font-semibold text-primary">
                          Uploading...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold">
                          Click to upload image
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          PNG, JPG, WEBP, SVG • Max 10MB
                        </p>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Name EN */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Name (English) *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug:
                        form.slug ||
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                    })
                  }
                  placeholder="iPhone"
                  className="h-10 rounded-xl text-sm border-primary/15"
                />
              </div>

              {/* Name AM */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  ስም (Amharic) *
                </Label>
                <Input
                  value={form.nameAm}
                  onChange={(e) => setForm({ ...form, nameAm: e.target.value })}
                  placeholder="አይፎን"
                  className="h-10 rounded-xl text-sm border-primary/15"
                />
              </div>

              {/* Slug */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Slug *
                </Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="iphone"
                  className="h-10 rounded-xl text-sm border-primary/15"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Description (optional)
                </Label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-primary/15 bg-transparent resize-none focus:outline-none focus:border-primary"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl h-11 border-2 border-primary/20 font-semibold text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
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
                      {editing ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}