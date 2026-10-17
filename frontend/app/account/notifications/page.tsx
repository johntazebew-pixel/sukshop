'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  Send,
  Check,
  X,
  Loader2,
  Smartphone,
  Mail,
  Package,
  Shield,
  Sparkles,
  Link2,
  Unlink,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { notifyTelegramStatusUpdated } from '@/hooks/use-telegram-status';

interface TelegramStatus {
  connected: boolean;
  username?: string;
  connectedAt?: string;
}

interface Preferences {
  telegramEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  securityAlerts: boolean;
}

export default function NotificationsPage() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    try {
      const [statusRes, prefsRes] = await Promise.all([
        api.get('/notifications/telegram/status'),
        api.get('/notifications/preferences'),
      ]);
      setStatus(statusRes.data);
      setPrefs(prefsRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleConnect = async () => {
    if (!chatId.trim()) {
      toast.error('Enter your Telegram Chat ID');
      return;
    }

    setConnecting(true);
    try {
      await api.post('/notifications/telegram/connect', {
        chatId: chatId.trim(),
        telegramUsername: username.trim() || 'user',
      });
      toast.success('Telegram connected! Check your messages 📱');
      await load();
      setChatId('');
      setUsername('');
      notifyTelegramStatusUpdated();
    } catch (error: any) {
      toast.error('Failed to connect', {
        description: error.response?.data?.message,
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Telegram notifications?')) return;
    try {
      await api.delete('/notifications/telegram/disconnect');
      toast.success('Telegram disconnected');
      await load();
      notifyTelegramStatusUpdated();
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await api.post('/notifications/telegram/test');
      toast.success('Test notification sent! 📱', {
        description: res.data?.message || 'Check your Telegram app for the alert.',
      });
    } catch (err: any) {
      toast.error('Failed to send test', {
        description: err.response?.data?.message || 'Make sure your bot chat is started.',
      });
    } finally {
      setTesting(false);
    }
  };

  const updatePref = async (key: keyof Preferences) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await api.patch('/notifications/preferences', { [key]: newPrefs[key] });
      toast.success('Preference updated');
    } catch {
      setPrefs(prefs);
      toast.error('Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage how you receive alerts and updates
        </p>
      </div>

      {/* Telegram Card */}
      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Send className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-base">Telegram Notifications</h2>
            <p className="text-xs text-muted-foreground">
              Get instant updates via Telegram
            </p>
          </div>
          {status?.connected ? (
            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 flex items-center gap-1">
              <Check className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold">
              Not Connected
            </span>
          )}
        </div>

        {status?.connected ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-green-50 border border-green-100">
              <p className="text-xs text-green-700">
                ✅ Connected as <strong>@{status.username}</strong>
              </p>
              <p className="text-[10px] text-green-600 mt-1">
                You'll receive order updates on Telegram
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handleTest}
                disabled={testing}
                variant="outline"
                size="sm"
                className="rounded-full border-primary/30 text-primary hover:bg-primary/5 text-xs"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <BellRing className="mr-1.5 h-3.5 w-3.5" /> Send Test Notification
                  </>
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-sky-300 text-sky-700 hover:bg-sky-50 text-xs"
              >
                <a
                  href="https://t.me/SukShop_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open @SukShop_bot <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/5 text-xs"
              >
                <Unlink className="mr-1.5 h-3 w-3" /> Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Instructions */}
            <div className="p-3 rounded-xl bg-secondary/50 border border-primary/10">
              <p className="text-xs font-semibold mb-2">How to connect:</p>
              <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal pl-4">
                <li>
                  Open Telegram and search <strong>@userinfobot</strong>
                </li>
                <li>Send /start and copy your Chat ID</li>
                <li>Paste it below and click Connect</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Chat ID
                </Label>
                <Input
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="123456789"
                  className="h-10 rounded-xl text-xs sm:text-sm border-primary/15"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Username (optional)
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  className="h-10 rounded-xl text-xs sm:text-sm border-primary/15"
                />
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={connecting}
              size="default"
              className="w-full rounded-full h-10 sm:h-11 bg-gradient-to-r from-primary to-accent hover:shadow-md font-semibold text-xs sm:text-sm"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <Link2 className="mr-1.5 h-4 w-4" /> Connect Telegram
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Preferences */}
      {prefs && (
        <div className="rounded-2xl border border-primary/10 bg-white p-5 space-y-4">
          <h2 className="font-bold text-base mb-2">Notification Preferences</h2>

          <div className="space-y-2">
            <PrefToggle
              icon={Send}
              label="Telegram Notifications"
              desc="Instant updates via Telegram"
              enabled={prefs.telegramEnabled}
              onToggle={() => updatePref('telegramEnabled')}
            />
            <PrefToggle
              icon={Package}
              label="Order Updates"
              desc="Placed, confirmed, shipped"
              enabled={prefs.orderUpdates}
              onToggle={() => updatePref('orderUpdates')}
            />
            <PrefToggle
              icon={Sparkles}
              label="Promotions"
              desc="Sales, discounts, new arrivals"
              enabled={prefs.promotions}
              onToggle={() => updatePref('promotions')}
            />
            <PrefToggle
              icon={Shield}
              label="Security Alerts"
              desc="Login, password changes"
              enabled={prefs.securityAlerts}
              onToggle={() => updatePref('securityAlerts')}
            />
            <PrefToggle
              icon={Mail}
              label="Email Notifications"
              desc="Receipts and updates"
              enabled={prefs.emailEnabled}
              onToggle={() => updatePref('emailEnabled')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PrefToggle({
  icon: Icon,
  label,
  desc,
  enabled,
  onToggle,
}: {
  icon: any;
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all text-left"
    >
      <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-primary' : 'bg-secondary border border-primary/20'
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}