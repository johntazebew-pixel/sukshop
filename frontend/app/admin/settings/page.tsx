'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Save,
  Upload,
  Loader2,
  Store,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-url';

interface Settings {
  logoUrl: string;
  siteName: string;
  siteNameEn: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (key: keyof Settings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // ==========================================
  // LOGO UPLOAD
  // ==========================================
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

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
      const url = await uploadService.uploadImage(file, 'logos');
      setSettings({ ...settings, logoUrl: url });
      toast.success('Logo uploaded! Click Save to apply.');
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.response?.data?.message || 'Try again',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ==========================================
  // SAVE ALL SETTINGS
  // ==========================================
  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const res = await api.post('/settings/bulk', settings);
      setSettings(res.data);
      toast.success('Settings saved ✅');
      setTimeout(() => window.location.reload(), 800);
    } catch (error: any) {
      toast.error('Save failed', {
        description: error.response?.data?.message || 'Try again',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Store <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your store's logo, branding, and contact details
        </p>
      </div>

      <div className="space-y-4">
        {/* ==========================================
            LOGO UPLOAD
            ========================================== */}
        <div className="rounded-2xl border border-primary/10 bg-white p-5">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Store Logo
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Preview */}
            <div className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden bg-secondary/30 flex-shrink-0 group">
              {settings.logoUrl ? (
                <>
                  <img
                    src={getImageUrl(settings.logoUrl)}
                    alt="Logo"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({ ...settings, logoUrl: '' })
                      }
                      className="h-8 w-8 rounded-full bg-white hover:bg-destructive hover:text-white flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs text-center px-2">
                  No logo
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="flex-1 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                onChange={handleLogoUpload}
                disabled={uploading || saving}
                className="hidden"
                id="logo-upload-input"
              />

              <Label className="text-xs font-semibold mb-2 block">
                Upload Logo
              </Label>

              <label
                htmlFor="logo-upload-input"
                className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  uploading || saving
                    ? 'border-primary/10 bg-secondary/30 cursor-not-allowed'
                    : 'border-primary/30 hover:border-primary hover:bg-primary/5'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <span className="text-xs font-semibold text-primary">
                      Uploading...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">
                      Click to upload
                    </span>
                  </>
                )}
              </label>

              <p className="text-[10px] text-muted-foreground mt-2">
                PNG, JPG, WEBP, SVG • Max 10MB • Recommended 512×512
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            SITE INFO
            ========================================== */}
        <div className="rounded-2xl border border-primary/10 bg-white p-5 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Site Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                Site Name (Amharic)
              </Label>
              <Input
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                placeholder="ሱቅShop"
                className="h-11 rounded-xl text-sm border-primary/15"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                Site Name (English)
              </Label>
              <Input
                value={settings.siteNameEn}
                onChange={(e) => handleChange('siteNameEn', e.target.value)}
                placeholder="SukShop"
                className="h-11 rounded-xl text-sm border-primary/15"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Tagline
            </Label>
            <Input
              value={settings.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="Ethiopia's trusted mobile phone store"
              className="h-11 rounded-xl text-sm border-primary/15"
            />
          </div>
        </div>

        {/* ==========================================
            CONTACT
            ========================================== */}
        <div className="rounded-2xl border border-primary/10 bg-white p-5 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                Phone
              </Label>
              <Input
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+251 911 223 344"
                className="h-11 rounded-xl text-sm border-primary/15"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                Email
              </Label>
              <Input
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="support@sukshop.com"
                className="h-11 rounded-xl text-sm border-primary/15"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Address
            </Label>
            <Input
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Bole, Addis Ababa, Ethiopia"
              className="h-11 rounded-xl text-sm border-primary/15"
            />
          </div>
        </div>

        {/* SAVE */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="default"
            className="rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent font-semibold text-xs sm:text-sm px-8 shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}