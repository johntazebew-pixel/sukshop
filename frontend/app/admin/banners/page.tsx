'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  X,
  Save,
  Eye,
  EyeOff,
  Upload,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

interface Banner {
  id: number;
  titleEn: string;
  titleAm: string;
  subtitleEn?: string;
  subtitleAm?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titleEn: '',
    titleAm: '',
    subtitleEn: '',
    subtitleAm: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
    isActive: true,
  });

  const load = async () => {
    try {
      const res = await api.get('/banners/admin/all');
      setBanners(res.data);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      titleEn: '',
      titleAm: '',
      subtitleEn: '',
      subtitleAm: '',
      imageUrl: '',
      linkUrl: '/phones',
      order: banners.length,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      titleEn: banner.titleEn,
      titleAm: banner.titleAm,
      subtitleEn: banner.subtitleEn || '',
      subtitleAm: banner.subtitleAm || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      order: banner.order,
      isActive: banner.isActive,
    });
    setModalOpen(true);
  };

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file, 'banners');
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

    if (!form.titleEn.trim() || !form.titleAm.trim()) {
      toast.error('Title (English + Amharic) required');
      return;
    }

    if (!form.imageUrl) {
      toast.error('Please upload a banner image');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/banners/${editing.id}`, form);
        toast.success('Banner updated ✅');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created ✅');
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

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
            Promotions
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Homepage <span className="gradient-text">Banners</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage hero carousel slides ({banners.length} banner{banners.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Button
          onClick={openAdd}
          size="sm"
          className="rounded-full px-4 h-9 bg-gradient-to-r from-primary to-accent font-semibold text-xs sm:text-sm shadow-md self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Banner
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl mb-1">No banners yet</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Add your first banner to feature on the homepage
          </p>
          <Button onClick={openAdd} size="sm" className="rounded-full px-5 h-9 text-xs sm:text-sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add First Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-2xl border border-primary/10 bg-white overflow-hidden hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-48 h-32 sm:h-auto sm:min-h-[140px] flex-shrink-0 bg-secondary overflow-hidden">
                  {banner.imageUrl ? (
                    <img
                      src={getImageUrl(banner.imageUrl)}
                      alt={banner.titleEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-primary/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Order: {banner.order}
                    </p>
                    {banner.isActive ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                        <Eye className="h-2.5 w-2.5" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold">
                        <EyeOff className="h-2.5 w-2.5" />
                        HIDDEN
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm">{banner.titleEn}</h3>
                  <p className="text-xs text-muted-foreground">
                    {banner.titleAm}
                  </p>
                  {banner.subtitleEn && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {banner.subtitleEn}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                      onClick={() => openEdit(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-semibold transition-colors"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id, banner.titleEn)}
                      disabled={deleting === banner.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-[11px] font-semibold transition-colors"
                    >
                      {deleting === banner.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-primary/10 bg-white z-10">
              <h2 className="text-lg font-bold">
                {editing ? 'Edit Banner' : 'Add Banner'}
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
                  Banner Image *
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading || saving}
                  className="hidden"
                  id="banner-image-input"
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
                        htmlFor="banner-image-input"
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
                    htmlFor="banner-image-input"
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
                          Click to upload banner image
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          PNG, JPG, WEBP • 1200×600 recommended
                        </p>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Title (English) *
                  </Label>
                  <Input
                    value={form.titleEn}
                    onChange={(e) =>
                      setForm({ ...form, titleEn: e.target.value })
                    }
                    placeholder="Find Your Perfect Phone"
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    ርዕስ (Amharic) *
                  </Label>
                  <Input
                    value={form.titleAm}
                    onChange={(e) =>
                      setForm({ ...form, titleAm: e.target.value })
                    }
                    placeholder="ፍጹም ስልክዎን ያግኙ"
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Subtitle (English)
                  </Label>
                  <Input
                    value={form.subtitleEn}
                    onChange={(e) =>
                      setForm({ ...form, subtitleEn: e.target.value })
                    }
                    placeholder="Best prices in Ethiopia"
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    ንዑስ ርዕስ (Amharic)
                  </Label>
                  <Input
                    value={form.subtitleAm}
                    onChange={(e) =>
                      setForm({ ...form, subtitleAm: e.target.value })
                    }
                    placeholder="በኢትዮጵያ ምርጥ ዋጋ"
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
              </div>

              {/* Link + Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Link URL
                  </Label>
                  <Input
                    value={form.linkUrl}
                    onChange={(e) =>
                      setForm({ ...form, linkUrl: e.target.value })
                    }
                    placeholder="/phones"
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">
                    Display Order
                  </Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                    className="h-10 rounded-xl text-sm border-primary/15"
                  />
                </div>
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 accent-[oklch(0.55_0.15_155)]"
                />
                <span className="text-xs font-semibold">
                  Active (visible on homepage)
                </span>
              </label>

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