'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Check,
  ExternalLink,
  ShieldCheck,
  BellRing,
  Unlink,
  Copy,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  Loader2,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  TelegramStatusData,
  notifyTelegramStatusUpdated,
} from '@/hooks/use-telegram-status';

export function TelegramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z" />
    </svg>
  );
}

interface TelegramConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: TelegramStatusData | null;
  onStatusUpdated?: () => void;
}

export function TelegramConnectDialog({
  open,
  onOpenChange,
  status,
  onStatusUpdated,
}: TelegramConnectDialogProps) {
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const botUsername = status?.botUsername || 'SukShop_bot';
  const isConnected = !!status?.connected;

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = chatId.trim();
    if (!cleanId) {
      toast.error('Please enter your Telegram Chat ID');
      return;
    }

    setConnecting(true);
    try {
      const res = await api.post('/notifications/telegram/connect', {
        chatId: cleanId,
        telegramUsername: username.trim().replace(/^@/, '') || 'user',
      });
      toast.success('Telegram Connected! 🎉', {
        description:
          res.data?.message || 'You will now receive order notifications.',
      });
      setChatId('');
      setUsername('');
      notifyTelegramStatusUpdated();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      toast.error('Connection failed', {
        description:
          err.response?.data?.message || 'Could not connect Telegram account',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram notifications?')) {
      return;
    }

    setDisconnecting(true);
    try {
      await api.delete('/notifications/telegram/disconnect');
      toast.success('Telegram disconnected');
      notifyTelegramStatusUpdated();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      toast.error('Failed to disconnect', {
        description: err.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const res = await api.post('/notifications/telegram/test');
      toast.success('Test Message Sent! 📱', {
        description: res.data?.message || 'Check your Telegram app for the alert.',
      });
    } catch (err: any) {
      toast.error('Test notification failed', {
        description:
          err.response?.data?.message ||
          'Make sure you have started a chat with the bot in Telegram.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePasteChatId = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        const digits = text.replace(/[^0-9-]/g, '').trim();
        if (digits) {
          setChatId(digits);
          toast.success('Pasted Chat ID from clipboard');
        } else {
          toast.info('No Chat ID found in clipboard');
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border-primary/20 shadow-2xl bg-white">
        {/* Header with rich Telegram aesthetic */}
        <div className="relative p-6 bg-gradient-to-br from-[#0088cc] via-[#229ED9] to-[#2AABEE] text-white overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <DialogHeader className="relative z-10 text-left">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner border border-white/30">
                  <TelegramIcon className="h-5 w-5" />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white">
                  Telegram Notifications
                </DialogTitle>
              </div>

              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white/90 text-xs font-semibold backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  Not Connected
                </span>
              )}
            </div>

            <DialogDescription className="text-white/85 text-xs sm:text-sm max-w-md">
              Receive real-time order updates, tracking alerts, and delivery receipts
              instantly on your phone via Telegram.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isConnected ? (
            /* ================= CONNECTED VIEW ================= */
            <div className="space-y-5">
              {/* Active Connection Status Card */}
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">
                        Account Successfully Connected
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Orders and notifications are synced to Telegram.
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="px-3 py-2 rounded-xl bg-white/90 border border-emerald-500/15">
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                          Username
                        </span>
                        <span className="font-semibold text-foreground truncate block">
                          @{status.username || 'user'}
                        </span>
                      </div>
                      {status.chatId && (
                        <div className="px-3 py-2 rounded-xl bg-white/90 border border-emerald-500/15">
                          <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                            Chat ID
                          </span>
                          <span className="font-mono font-semibold text-foreground truncate block">
                            {status.chatId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Package className="h-4 w-4 mx-auto text-primary mb-1.5" />
                  <span className="text-[11px] font-semibold block text-foreground">
                    Order Updates
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Receipts & Status
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Truck className="h-4 w-4 mx-auto text-primary mb-1.5" />
                  <span className="text-[11px] font-semibold block text-foreground">
                    Live Tracking
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Shipping Alerts
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Sparkles className="h-4 w-4 mx-auto text-primary mb-1.5" />
                  <span className="text-[11px] font-semibold block text-foreground">
                    Delivery Confirmed
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Instant Ping
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Test notification button */}
                  <Button
                    onClick={handleTestNotification}
                    disabled={testing}
                    className="w-full rounded-xl h-10 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold text-xs shadow-sm"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Sending Ping...
                      </>
                    ) : (
                      <>
                        <BellRing className="mr-1.5 h-3.5 w-3.5" />
                        Send Test Ping
                      </>
                    )}
                  </Button>

                  {/* Open bot link */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl h-10 border-sky-200 text-sky-700 hover:bg-sky-50 font-semibold text-xs"
                  >
                    <a
                      href={`https://t.me/${botUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TelegramIcon className="mr-1.5 h-3.5 w-3.5 text-[#229ED9]" />
                      Open @{botUsername}
                      <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                  >
                    <Link
                      href="/account/notifications"
                      onClick={() => onOpenChange(false)}
                    >
                      Preferences
                    </Link>
                  </Button>

                  <Button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2"
                  >
                    {disconnecting ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unlink className="mr-1 h-3 w-3" />
                        Disconnect Telegram
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= NOT CONNECTED VIEW ================= */
            <div className="space-y-5">
              {/* Benefits Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-100 p-3.5">
                <div className="flex items-center gap-2 text-sky-800 text-xs font-semibold mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  Why connect Telegram?
                </div>
                <p className="text-[11px] text-sky-700/90 leading-relaxed">
                  Never miss an order update! When you make a purchase or your delivery
                  status changes, our bot notifies you instantly on Telegram.
                </p>
              </div>

              {/* Step 1: Open the bot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                      1
                    </span>
                    Open the Telegram Bot
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Get your Chat ID
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`https://t.me/${botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-all hover:border-sky-300"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shrink-0">
                        <TelegramIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate text-foreground group-hover:text-primary transition-colors">
                          @{botUsername}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          Official Store Bot
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>

                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate text-foreground group-hover:text-primary transition-colors">
                          @userinfobot
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          Get ID in 1 second
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                </div>
                <p className="text-[10px] text-muted-foreground pl-0.5">
                  👉 Click either bot, press <strong>Start</strong> in Telegram, and copy
                  the numeric ID shown.
                </p>
              </div>

              {/* Step 2: Form */}
              <form onSubmit={handleConnect} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                      2
                    </span>
                    Enter your Telegram Details
                  </span>
                  {typeof navigator !== 'undefined' && (
                    <button
                      type="button"
                      onClick={handlePasteChatId}
                      className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="h-2.5 w-2.5" /> Paste from clipboard
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="telegram-chat-id"
                      className="text-xs font-semibold mb-1 block"
                    >
                      Telegram Chat ID <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="telegram-chat-id"
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                        placeholder="e.g. 123456789"
                        required
                        className="h-10 rounded-xl text-xs sm:text-sm pr-10 border-primary/20 focus:border-primary font-mono"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <TelegramIcon className="h-4 w-4 opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="telegram-username"
                      className="text-xs font-semibold mb-1 block"
                    >
                      Telegram Username{' '}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="telegram-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@yourusername"
                      className="h-10 rounded-xl text-xs sm:text-sm border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={connecting || !chatId.trim()}
                  className="w-full rounded-2xl h-11 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all hover:scale-[1.01]"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting Account...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Connect Telegram Account
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
