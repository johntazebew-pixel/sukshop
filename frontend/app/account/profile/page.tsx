'use client';

import { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

type Tab = 'info' | 'password';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Profile <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account information and password
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-primary/10">
        <TabButton
          active={activeTab === 'info'}
          onClick={() => setActiveTab('info')}
          icon={User}
        >
          Personal Info
        </TabButton>
        <TabButton
          active={activeTab === 'password'}
          onClick={() => setActiveTab('password')}
          icon={Shield}
        >
          Password
        </TabButton>
      </div>

      {/* Content */}
      {activeTab === 'info' && <PersonalInfoTab user={user} setUser={setUser} />}
      {activeTab === 'password' && <PasswordTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active
          ? 'text-primary border-primary'
          : 'text-muted-foreground border-transparent hover:text-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// ==========================================
// PERSONAL INFO TAB
// ==========================================
function PersonalInfoTab({ user, setUser }: { user: any; setUser: any }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async () => {
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.length < 2) newErrors.name = 'At least 2 characters';
    else if (form.name.length > 25) newErrors.name = 'Maximum 25 characters';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Enter a valid email';

    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone))
      newErrors.phone = 'Enter a valid phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors');
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch('/users/profile', form);
      setUser(response.data);
      toast.success('Profile updated successfully ✅');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to update profile';
      toast.error('Update failed', { description: message });
      setErrors({ general: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4 pb-4 border-b border-primary/10">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-bold text-base">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wide">
            {user?.role}
          </p>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          Full Name *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            disabled={saving}
            className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
              errors.name
                ? 'border-destructive'
                : 'border-primary/15 focus:border-primary'
            }`}
          />
        </div>
        {errors.name && (
          <p className="text-destructive text-[11px] mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          Email Address *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            disabled={saving}
            className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
              errors.email
                ? 'border-destructive'
                : 'border-primary/15 focus:border-primary'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-destructive text-[11px] mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+251 911 223 344"
            disabled={saving}
            className={`pl-10 h-10 rounded-xl text-xs sm:text-sm ${
              errors.phone
                ? 'border-destructive'
                : 'border-primary/15 focus:border-primary'
            }`}
          />
        </div>
        {errors.phone && (
          <p className="text-destructive text-[11px] mt-1">{errors.phone}</p>
        )}
      </div>

      {/* General error */}
      {errors.general && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-xs">{errors.general}</p>
        </div>
      )}

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        size="default"
        className="w-full rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
      >
        {saving ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-1.5 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}

// ==========================================
// PASSWORD TAB
// ==========================================
function PasswordTab() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordChecks = {
    length: form.newPassword.length >= 8,
    upper: /[A-Z]/.test(form.newPassword),
    lower: /[a-z]/.test(form.newPassword),
    number: /\d/.test(form.newPassword),
    special: /[@$!%*?&#^()_\-+=]/.test(form.newPassword),
  };
  const allPass = Object.values(passwordChecks).every(Boolean);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async () => {
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.currentPassword)
      newErrors.currentPassword = 'Current password is required';

    if (!form.newPassword) newErrors.newPassword = 'New password is required';
    else if (!allPass) newErrors.newPassword = 'Password does not meet requirements';

    if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/users/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully ✅');
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to change password';
      toast.error('Change failed', { description: message });
      setErrors({ general: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-5 space-y-4">
      {/* Security notice */}
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
        <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Use a strong password with at least 8 characters, mixed case, numbers,
          and special characters.
        </p>
      </div>

      {/* Current Password */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          Current Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showCurrent ? 'text' : 'password'}
            value={form.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            placeholder="Enter current password"
            disabled={saving}
            className={`pl-10 pr-10 h-11 rounded-xl text-sm ${
              errors.currentPassword
                ? 'border-destructive'
                : 'border-primary/15 focus:border-primary'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
          >
            {showCurrent ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-destructive text-[11px] mt-1">
            {errors.currentPassword}
          </p>
        )}
      </div>

      {/* New Password */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          New Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showNew ? 'text' : 'password'}
            value={form.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            placeholder="Enter new password"
            disabled={saving}
            className={`pl-10 pr-10 h-11 rounded-xl text-sm ${
              errors.newPassword
                ? 'border-destructive'
                : 'border-primary/15 focus:border-primary'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
          >
            {showNew ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password rules */}
        {form.newPassword && (
          <div className="mt-3 flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-secondary/50 border border-primary/10">
            <Pill label="8+" passed={passwordChecks.length} />
            <Pill label="A-Z" passed={passwordChecks.upper} />
            <Pill label="a-z" passed={passwordChecks.lower} />
            <Pill label="0-9" passed={passwordChecks.number} />
            <Pill label="!@#" passed={passwordChecks.special} />
          </div>
        )}

        {errors.newPassword && (
          <p className="text-destructive text-[11px] mt-1">
            {errors.newPassword}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <Label className="text-xs font-semibold mb-1.5 block">
          Confirm New Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showNew ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Re-enter new password"
            disabled={saving}
            className={`pl-10 h-11 rounded-xl text-sm ${
              errors.confirmPassword
                ? 'border-destructive'
                : 'border-primary/15 focus:border-primary'
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-destructive text-[11px] mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* General error */}
      {errors.general && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-xs">{errors.general}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSave}
        disabled={saving}
        size="default"
        className="w-full rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
      >
        {saving ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="mr-1.5 h-4 w-4" />
            Update Password
          </>
        )}
      </Button>
    </div>
  );
}

function Pill({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
        passed
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-white text-muted-foreground border border-primary/10'
      }`}
    >
      {passed ? <Check className="h-2.5 w-2.5" /> : null}
      {label}
    </div>
  );
}