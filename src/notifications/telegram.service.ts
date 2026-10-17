import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: any = null;
  private directBot: any = null;
  private cleanToken: string | null = null;
  private botUsername: string = process.env.TELEGRAM_BOT_USERNAME || 'SukShop_bot';

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const apiUrl = process.env.TELEGRAM_API_URL;
    const proxyUrl = process.env.TELEGRAM_PROXY_URL;

    this.logger.log(`🔍 Token: ${token ? 'exists' : 'MISSING'}`);
    if (proxyUrl && proxyUrl.trim().length > 0) {
      this.logger.log(`🔍 SOCKS Proxy: ${proxyUrl}`);
    }
    if (apiUrl && apiUrl.trim().length > 0) {
      this.logger.log(`🔍 API URL: ${apiUrl}`);
    }

    if (!token) {
      this.logger.warn('⚠️ TELEGRAM_BOT_TOKEN not set');
      return;
    }

    this.cleanToken = token.trim().replace(/^["']|["']$/g, '');

    try {
      // 1. Initialize Direct Bot as fallback/primary
      const directOptions: any = { polling: false };
      if (apiUrl && apiUrl.trim().length > 0) {
        directOptions.baseApiUrl = apiUrl.trim().replace(/^["']|["']$/g, '');
      }
      this.directBot = new TelegramBot(this.cleanToken, directOptions);
      this.attachErrorHandlers(this.directBot, 'Direct');

      // 2. If proxy configured, try creating proxied bot
      if (proxyUrl && proxyUrl.trim().length > 0) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { SocksProxyAgent } = require('socks-proxy-agent');
          const cleanProxy = proxyUrl.trim().replace(/^["']|["']$/g, '');
          const agent = new SocksProxyAgent(cleanProxy);
          const proxiedOptions: any = {
            polling: false,
            request: { agent },
          };
          if (apiUrl && apiUrl.trim().length > 0) {
            proxiedOptions.baseApiUrl = apiUrl.trim().replace(/^["']|["']$/g, '');
          }
          this.bot = new TelegramBot(this.cleanToken, proxiedOptions);
          this.attachErrorHandlers(this.bot, 'Proxy');
          this.logger.log(`🌐 Configured Telegram Bot with SOCKS proxy: ${cleanProxy}`);
        } catch (proxyErr: any) {
          this.logger.warn(
            `Failed to configure SOCKS proxy (${proxyErr.message}), falling back to direct`,
          );
          this.bot = this.directBot;
        }
      } else {
        this.bot = this.directBot;
        this.logger.log('🌐 Configured Telegram Bot with direct connection');
      }

      // Verify bot connectivity
      this.verifyConnection();
    } catch (e: any) {
      this.logger.error(`❌ Telegram init failed: ${e.message}`);
    }
  }

  private attachErrorHandlers(botInstance: any, label: string) {
    if (botInstance && typeof botInstance.on === 'function') {
      botInstance.on('error', (err: any) => {
        this.logger.warn(`Telegram (${label}) network warning: ${err.message}`);
      });
      botInstance.on('polling_error', (err: any) => {
        this.logger.warn(`Telegram (${label}) polling warning: ${err.message}`);
      });
    }
  }

  private verifyConnection() {
    if (!this.bot) return;

    this.bot
      .getMe()
      .then((info: any) => {
        if (info?.username) this.botUsername = info.username;
        this.logger.log(`✅ Telegram Bot verified: @${info.username}`);
      })
      .catch((err: any) => {
        this.logger.warn(
          `⚠️ Primary Telegram getMe failed: ${err.message}. Testing direct connection...`,
        );
        if (this.directBot && this.bot !== this.directBot) {
          this.directBot
            .getMe()
            .then((info: any) => {
              if (info?.username) this.botUsername = info.username;
              this.logger.log(
                `✅ Direct connection succeeded: @${info.username}. Switching to direct bot.`,
              );
              this.bot = this.directBot;
            })
            .catch((directErr: any) => {
              this.logger.warn(
                `⚠️ Direct Telegram getMe also failed: ${directErr.message}`,
              );
            });
        }
      });
  }

  getBotUsername(): string {
    return this.botUsername || 'SukShop_bot';
  }

  // ==========================================
  // Image resolver: handles local uploads & remote URLs
  // ==========================================
  private resolveImageSource(
    imageUrl?: string,
  ): { type: 'local' | 'url' | 'none'; pathOrUrl?: string } {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return { type: 'none' };
    }

    const trimmed = imageUrl.trim();

    // 1. Check if it's a local /uploads path
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
      const cleanRel = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
      const fullPath = path.join(process.cwd(), cleanRel);
      if (fs.existsSync(fullPath)) {
        return { type: 'local', pathOrUrl: fullPath };
      }
    }

    // 2. Check if it's localhost or 127.0.0.1 url with /uploads
    if (
      trimmed.includes('localhost') ||
      trimmed.includes('127.0.0.1')
    ) {
      try {
        const parsed = new URL(trimmed);
        const relPath = parsed.pathname.startsWith('/')
          ? parsed.pathname.slice(1)
          : parsed.pathname;
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          return { type: 'local', pathOrUrl: fullPath };
        }
      } catch {
        // invalid URL format, ignore
      }
      return { type: 'none' }; // Localhost URLs cannot be fetched by Telegram servers
    }

    // 3. Public HTTPS/HTTP URL
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return { type: 'url', pathOrUrl: trimmed };
    }

    return { type: 'none' };
  }

  // ==========================================
  // Send text message
  // ==========================================
  async sendMessage(
    chatId: string,
    message: string,
    buttons?: any,
  ): Promise<boolean> {
    if (!this.bot && !this.directBot) {
      this.logger.warn('⚠️ Bot not initialized');
      return false;
    }

    const options: any = {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (buttons) {
      options.reply_markup = buttons;
    }

    // Try primary bot
    try {
      const activeBot = this.bot || this.directBot;
      await activeBot.sendMessage(chatId, message, options);
      this.logger.log(`✅ Message sent to ${chatId}`);
      return true;
    } catch (error: any) {
      this.logger.warn(`Primary send failed: ${error?.message}`);

      // If primary failed and directBot is different, retry directly
      if (this.directBot && this.bot !== this.directBot) {
        try {
          this.logger.log('🔄 Retrying send via direct bot...');
          await this.directBot.sendMessage(chatId, message, options);
          this.bot = this.directBot; // switch permanently to direct
          this.logger.log(`✅ Message sent to ${chatId} via direct connection`);
          return true;
        } catch (directErr: any) {
          this.logger.error(`❌ Direct send also failed: ${directErr?.message}`);
        }
      }

      if (error.response?.body) {
        this.logger.error(
          `Details: ${JSON.stringify(error.response.body)}`,
        );
      }
      return false;
    }
  }

  // ==========================================
  // Send photo (with fallback to text)
  // ==========================================
  async sendPhoto(
    chatId: string,
    imageSource: string,
    caption: string,
    buttons?: any,
  ): Promise<boolean> {
    const resolved = this.resolveImageSource(imageSource);

    // If no valid image found, fall back to text message
    if (resolved.type === 'none' || !resolved.pathOrUrl) {
      return this.sendMessage(chatId, caption, buttons);
    }

    if (!this.bot && !this.directBot) {
      this.logger.warn('⚠️ Bot not initialized');
      return false;
    }

    // Telegram caption limit is 1024 characters
    const trimmedCaption =
      caption.length > 1024 ? caption.slice(0, 1020) + '...' : caption;

    const options: any = {
      caption: trimmedCaption,
      parse_mode: 'HTML',
    };
    if (buttons) {
      options.reply_markup = buttons;
    }

    try {
      const activeBot = this.bot || this.directBot;
      await activeBot.sendPhoto(chatId, resolved.pathOrUrl, options);
      this.logger.log(`✅ Photo sent to ${chatId}`);
      return true;
    } catch (error: any) {
      this.logger.warn(`Photo send failed (${error?.message}). Falling back to text...`);

      // If network error and direct bot available, try text fallback on direct
      return this.sendMessage(chatId, caption, buttons);
    }
  }

  // ==========================================
  // Customer Order Notification
  // ==========================================
  async sendCustomerOrderNotification(
    chatId: string,
    orderNumber: string,
    status: string,
    total?: number,
    items?: any[],
    extra?: {
      itemCount?: number;
      customerName?: string;
      shippingAddress?: string;
      trackingNumber?: string;
      courierName?: string;
      note?: string;
    },
  ): Promise<boolean> {
    const emoji = this.getStatusEmoji(status);
    const statusText = this.getStatusText(status);

    let caption = '';

    if (status === 'PENDING') {
      caption += `🎉 <b>Order Placed Successfully!</b>\n\n`;
      caption += `Thank you for shopping with SukShop! We have received your order and are preparing it.\n\n`;
    } else if (status === 'CONFIRMED') {
      caption += `✅ <b>Order Confirmed!</b>\n\n`;
      caption += `Your order has been confirmed by our team and is scheduled for processing.\n\n`;
    } else if (status === 'PROCESSING') {
      caption += `📦 <b>Order Being Prepared!</b>\n\n`;
      caption += `Your items are currently being inspected and packed for dispatch.\n\n`;
    } else if (status === 'SHIPPED') {
      caption += `🚚 <b>Order Shipped!</b>\n\n`;
      caption += `Your package has been dispatched and is on its way to you!\n\n`;
    } else if (status === 'OUT_FOR_DELIVERY') {
      caption += `🛵 <b>Out for Delivery!</b>\n\n`;
      caption += `Your courier is delivering your order today. Please be ready to receive it!\n\n`;
    } else if (status === 'DELIVERED') {
      caption += `🎊 <b>Order Delivered & Finished!</b>\n\n`;
      caption += `Your order has arrived! Thank you for choosing SukShop. We hope you love your purchase! 📱✨\n\n`;
    } else if (status === 'CANCELLED') {
      caption += `❌ <b>Order Cancelled</b>\n\n`;
      caption += `Your order has been cancelled.\n\n`;
    } else {
      caption += `${emoji} <b>Order Update: ${statusText}</b>\n\n`;
    }

    caption += `📦 <b>Order:</b> <code>${orderNumber}</code>\n`;
    caption += `📊 <b>Status:</b> <b>${statusText}</b>\n`;

    if (extra?.itemCount) {
      caption += `🛍️ <b>Total Items:</b> ${extra.itemCount}\n`;
    }

    if (total !== undefined) {
      caption += `💰 <b>Total Amount:</b> ${Number(total).toLocaleString()} ETB\n`;
    }

    // Items list
    if (items && items.length > 0) {
      caption += `\n━━━━━━━━━━━━━━━━━\n`;
      caption += `<b>🛒 Ordered Items</b>\n`;
      caption += `━━━━━━━━━━━━━━━━━\n`;

      items.slice(0, 5).forEach((item, idx) => {
        const itemPrice = (item.price || 0) * (item.quantity || 1);
        caption += `\n<b>${idx + 1}.</b> ${item.name}\n`;
        caption += `    💵 ${itemPrice.toLocaleString()} ETB (× ${item.quantity})\n`;
      });

      if (items.length > 5) {
        caption += `\n<i>... and ${items.length - 5} more item(s)</i>\n`;
      }

      caption += `\n━━━━━━━━━━━━━━━━━\n`;
    }

    // Courier & Tracking
    if (extra?.trackingNumber) {
      caption += `\n🚚 <b>Tracking Number:</b> <code>${extra.trackingNumber}</code>\n`;
    }
    if (extra?.courierName) {
      caption += `📮 <b>Courier:</b> ${extra.courierName}\n`;
    }
    if (extra?.note) {
      caption += `📝 <b>Note:</b> ${extra.note}\n`;
    }

    // Address
    if (extra?.shippingAddress) {
      caption += `\n📍 <b>Delivery Address:</b>\n<i>${extra.shippingAddress}</i>\n`;
    }

    // Links & Buttons
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const isPublic =
      frontendUrl &&
      !frontendUrl.includes('localhost') &&
      !frontendUrl.includes('127.0.0.1') &&
      frontendUrl.startsWith('http');

    let buttons: any = undefined;
    if (isPublic) {
      buttons = {
        inline_keyboard: [
          [
            {
              text: '📦 Track Order Live',
              url: `${frontendUrl}/track?q=${orderNumber}`,
            },
          ],
          [
            { text: '🛍️ SukShop Phones', url: `${frontendUrl}/phones` },
            { text: '📞 Support', url: `${frontendUrl}/contact` },
          ],
        ],
      };
    } else {
      caption += `\n🔗 <b>Track:</b> <code>${frontendUrl}/track?q=${orderNumber}</code>\n`;
    }

    const firstImage = items?.find((i) => i.imageUrl)?.imageUrl;
    if (firstImage) {
      return this.sendPhoto(chatId, firstImage, caption, buttons);
    }

    return this.sendMessage(chatId, caption, buttons);
  }

  // ==========================================
  // Admin Order Notification
  // ==========================================
  async sendAdminOrderNotification(
    chatId: string,
    orderNumber: string,
    status: string,
    total?: number,
    items?: any[],
    extra?: {
      orderId?: number;
      itemCount?: number;
      customerName?: string;
      customerPhone?: string;
      shippingAddress?: string;
      trackingNumber?: string;
      courierName?: string;
      note?: string;
    },
  ): Promise<boolean> {
    const statusText = this.getStatusText(status);

    let caption = '';

    if (status === 'PENDING') {
      caption += `🚨 <b>NEW ORDER RECEIVED!</b> 🛍️\n\n`;
      caption += `A customer has just placed a new order!\n\n`;
    } else if (status === 'DELIVERED') {
      caption += `🏁 <b>ORDER COMPLETED (DELIVERED)</b> ✅\n\n`;
      caption += `Order has been successfully marked as completed!\n\n`;
    } else if (status === 'CANCELLED') {
      caption += `⚠️ <b>ORDER CANCELLED</b> ❌\n\n`;
    } else {
      caption += `📝 <b>ORDER STATUS UPDATED: ${statusText}</b>\n\n`;
    }

    caption += `📦 <b>Order:</b> <code>${orderNumber}</code>\n`;
    caption += `📊 <b>Status:</b> <b>${statusText}</b>\n`;

    if (extra?.customerName) {
      caption += `👤 <b>Customer:</b> ${extra.customerName}\n`;
    }
    if (extra?.customerPhone && extra.customerPhone !== 'N/A') {
      caption += `📞 <b>Phone:</b> <code>${extra.customerPhone}</code>\n`;
    }

    if (total !== undefined) {
      caption += `💰 <b>Total:</b> <b>${Number(total).toLocaleString()} ETB</b>\n`;
    }

    if (extra?.shippingAddress) {
      caption += `📍 <b>Address:</b> <i>${extra.shippingAddress}</i>\n`;
    }

    // Items summary
    if (items && items.length > 0) {
      caption += `\n━━━━━━━━━━━━━━━━━\n`;
      caption += `<b>🛒 Order Items (${items.length}):</b>\n`;
      items.slice(0, 5).forEach((item, idx) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        caption += `${idx + 1}. ${item.name} (${item.quantity}x) — ${itemTotal.toLocaleString()} ETB\n`;
      });
      if (items.length > 5) {
        caption += `<i>... and ${items.length - 5} more item(s)</i>\n`;
      }
      caption += `━━━━━━━━━━━━━━━━━\n`;
    }

    if (extra?.trackingNumber) {
      caption += `\n🚚 <b>Tracking:</b> <code>${extra.trackingNumber}</code>`;
      if (extra?.courierName) caption += ` (${extra.courierName})`;
      caption += `\n`;
    }

    if (extra?.note) {
      caption += `📝 <b>Note:</b> <i>${extra.note}</i>\n`;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const isPublic =
      frontendUrl &&
      !frontendUrl.includes('localhost') &&
      !frontendUrl.includes('127.0.0.1') &&
      frontendUrl.startsWith('http');

    let buttons: any = undefined;
    if (isPublic && extra?.orderId) {
      buttons = {
        inline_keyboard: [
          [
            {
              text: '⚙️ Open Admin Dashboard',
              url: `${frontendUrl}/admin/orders/${extra.orderId}`,
            },
          ],
        ],
      };
    } else if (extra?.orderId) {
      caption += `\n🔗 <b>Admin Link:</b> <code>${frontendUrl}/admin/orders/${extra.orderId}</code>\n`;
    }

    const firstImage = items?.find((i) => i.imageUrl)?.imageUrl;
    if (firstImage) {
      return this.sendPhoto(chatId, firstImage, caption, buttons);
    }

    return this.sendMessage(chatId, caption, buttons);
  }

  // Backward compatibility method
  async sendOrderNotification(
    chatId: string,
    orderNumber: string,
    status: string,
    total?: number,
    items?: any[],
    extra?: any,
  ): Promise<boolean> {
    return this.sendCustomerOrderNotification(
      chatId,
      orderNumber,
      status,
      total,
      items,
      extra,
    );
  }

  // ==========================================
  // Welcome message
  // ==========================================
  async sendWelcome(chatId: string, userName: string): Promise<boolean> {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3001';

    const message = `
🎉 <b>Welcome to SukShop, ${userName}!</b>

Your Telegram account is now connected.
You'll receive instant updates for:

✅ Order placements
✅ Shipping & delivery updates
✅ Order completion confirmations

Thank you for choosing SukShop! 📱
`;

    const isPublic =
      frontendUrl &&
      !frontendUrl.includes('localhost') &&
      !frontendUrl.includes('127.0.0.1') &&
      frontendUrl.startsWith('http');

    let buttons: any = undefined;

    if (isPublic) {
      buttons = {
        inline_keyboard: [
          [
            {
              text: '🛍️ Shop Now',
              url: `${frontendUrl}/phones`,
            },
          ],
          [
            {
              text: '📦 My Orders',
              url: `${frontendUrl}/account/orders`,
            },
          ],
        ],
      };
    }

    return this.sendMessage(chatId, message, buttons);
  }

  // ==========================================
  // Helpers
  // ==========================================
  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      PENDING: '⏳',
      CONFIRMED: '✅',
      PROCESSING: '📦',
      SHIPPED: '🚚',
      OUT_FOR_DELIVERY: '🛵',
      DELIVERED: '🎉',
      CANCELLED: '❌',
    };
    return emojis[status] || '📢';
  }

  private getStatusText(status: string): string {
    const texts: Record<string, string> = {
      PENDING: 'Order Placed',
      CONFIRMED: 'Order Confirmed',
      PROCESSING: 'Being Prepared',
      SHIPPED: 'Shipped',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
    };
    return texts[status] || status;
  }
}