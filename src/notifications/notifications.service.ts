import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async connectTelegram(userId: number, dto: ConnectTelegramDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cleanChatId = String(dto.chatId || '').trim();
    const cleanUsername = (dto.telegramUsername || user.name || 'user')
      .trim()
      .replace(/^@/, '');

    if (!cleanChatId) {
      throw new BadRequestException('Chat ID is required');
    }

    // Check if this chatId is used by ANOTHER user
    const existingOther = await this.prisma.telegramConnection.findFirst({
      where: {
        chatId: cleanChatId,
        userId: { not: userId },
      },
    });

    if (existingOther) {
      throw new BadRequestException(
        'This Telegram is already connected to another account',
      );
    }

    // Upsert: update if exists, create if not
    const connection = await this.prisma.telegramConnection.upsert({
      where: { userId },
      update: {
        chatId: cleanChatId,
        username: cleanUsername,
        phoneNumber: dto.phoneNumber, // 🆕 Save phone number
        isActive: true,
      },
      create: {
        userId,
        chatId: cleanChatId,
        username: cleanUsername,
        phoneNumber: dto.phoneNumber, // 🆕 Save phone number
        isActive: true,
      },
    });

    // Send welcome message
    this.telegram
      .sendWelcome(cleanChatId, user.name)
      .catch((err) => this.logger.error('Welcome message failed:', err));

    return {
      message: 'Telegram connected successfully',
      connection,
      botUsername: this.telegram.getBotUsername(),
    };
  }

  // 2. Disconnect Telegram
  async disconnectTelegram(userId: number) {
    const result = await this.prisma.telegramConnection.deleteMany({
      where: { userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('No Telegram connection found');
    }

    return { message: 'Telegram disconnected successfully' };
  }

  // 3. Get Telegram status
  async getTelegramStatus(userId: number) {
    const connection = await this.prisma.telegramConnection.findUnique({
      where: { userId },
    });

    const botUsername = this.telegram.getBotUsername();

    if (!connection) {
      return { connected: false, botUsername };
    }

    return {
      connected: connection.isActive,
      username: connection.username,
      connectedAt: connection.connectedAt,
      chatId: connection.chatId,
      botUsername,
    };
  }

  // 3b. Test Telegram connection
  async testTelegram(userId: number) {
    const connection = await this.prisma.telegramConnection.findUnique({
      where: { userId },
    });

    if (!connection || !connection.isActive) {
      throw new BadRequestException('Telegram is not connected yet');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const botUsername = this.telegram.getBotUsername();

    const testMessage = `
🔔 <b>Test Notification from SukShop!</b>

Hello ${user?.name || 'Valued Customer'}! 👋
Your Telegram connection is active and working properly! 🚀

You will receive instant notifications here for:
📦 Order Placements & Invoices
🚚 Shipping & Tracking Updates
🛵 Out for Delivery Alerts
🎉 Successful Deliveries

Thank you for choosing <b>SukShop</b>!
`;

    const success = await this.telegram.sendMessage(
      connection.chatId,
      testMessage,
    );

    if (!success) {
      throw new BadRequestException(
        `Could not send test message to Telegram. Please make sure you have started a chat with @${botUsername} first!`,
      );
    }

    return { message: 'Test notification sent to Telegram successfully!' };
  }

  // 4. Send notification
  async send(dto: SendNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        channel: dto.channel,
        title: dto.title,
        message: dto.message,
        status: 'PENDING',
      },
    });

    let sent = false;

    if (dto.channel === 'TELEGRAM') {
      sent = await this.sendViaTelegram(dto.userId, dto.message);
    }

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: sent ? 'SENT' : 'FAILED',
        sentAt: sent ? new Date() : null,
      },
    });

    return notification;
  }

  // 5. Send via Telegram (internal)
  private async sendViaTelegram(userId: number, message: string) {
    const connection = await this.prisma.telegramConnection.findUnique({
      where: { userId },
    });

    if (!connection || !connection.isActive) {
      this.logger.warn(`No active Telegram for user ${userId}`);
      return false;
    }

    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (prefs && !prefs.telegramEnabled) {
      this.logger.log(`User ${userId} disabled Telegram`);
      return false;
    }

    return this.telegram.sendMessage(connection.chatId, message);
  }

  async sendOrderUpdate(
    userId: number,
    orderNumber: string,
    status: string,
    total?: number,
    extraMeta?: {
      orderId?: number;
      note?: string;
      trackingNumber?: string;
      courierName?: string;
    },
  ) {
    // 1. Fetch full order details including user, items, and main product image
    let orderDetails: any = null;
    try {
      orderDetails = await this.prisma.order.findUnique({
        where: { orderNumber },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isMain: true }, take: 1 },
                },
              },
            },
          },
        },
      });
    } catch (err: any) {
      this.logger.warn(`Could not fetch order details: ${err?.message || err}`);
    }

    const orderId = orderDetails?.id || extraMeta?.orderId;
    const customerName = orderDetails?.user?.name || 'Customer';
    const customerPhone =
      orderDetails?.phone || orderDetails?.user?.phone || 'N/A';
    const shippingAddress = orderDetails?.shippingAddress || 'N/A';
    const trackingNumber =
      extraMeta?.trackingNumber || orderDetails?.trackingNumber;
    const courierName =
      extraMeta?.courierName || orderDetails?.courierName;
    const orderTotal =
      total !== undefined ? total : Number(orderDetails?.total || 0);

    // Build items array for notifications
    const items =
      orderDetails?.items?.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
        imageUrl: item.product?.images?.[0]?.url || null,
      })) || [];

    const extra = {
      orderId,
      itemCount:
        items.reduce((s: number, i: any) => s + i.quantity, 0) || items.length,
      customerName,
      customerPhone,
      shippingAddress,
      trackingNumber,
      courierName,
      note: extraMeta?.note,
    };

    // 2. Customer Notification
    try {
      const customerConnection = await this.prisma.telegramConnection.findUnique({
        where: { userId },
      });

      if (customerConnection && customerConnection.isActive) {
        const prefs = await this.prisma.notificationPreference.findUnique({
          where: { userId },
        });

        if (!prefs || prefs.orderUpdates) {
          await this.prisma.notification
            .create({
              data: {
                userId,
                type: 'ORDER',
                channel: 'TELEGRAM',
                title: `Order ${status}`,
                message: `Your order ${orderNumber} status: ${status}`,
                status: 'SENT',
              },
            })
            .catch(() => {});

          await this.telegram.sendCustomerOrderNotification(
            customerConnection.chatId,
            orderNumber,
            status,
            orderTotal,
            items,
            extra,
          );
        }
      } else {
        this.logger.log(`Customer ${userId} does not have Telegram connected`);
      }
    } catch (custErr: any) {
      this.logger.error(
        `Failed to send customer Telegram notification: ${custErr?.message}`,
      );
    }

    // 3. Admin Notification (Notify store owner / admin users)
    try {
      const adminConnections = await this.prisma.telegramConnection.findMany({
        where: {
          isActive: true,
          user: { role: 'ADMIN' },
        },
      });

      const adminChatIds = new Set<string>();
      for (const conn of adminConnections) {
        if (conn.chatId) adminChatIds.add(conn.chatId);
      }

      // Check optional env variable for admin chat ID
      const envAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (envAdminChatId && envAdminChatId.trim().length > 0) {
        adminChatIds.add(envAdminChatId.trim());
      }

      if (adminChatIds.size > 0) {
        this.logger.log(
          `📢 Dispatching admin Telegram notification for order ${orderNumber} (${status}) to ${adminChatIds.size} recipient(s)`,
        );
        for (const adminChatId of adminChatIds) {
          await this.telegram.sendAdminOrderNotification(
            adminChatId,
            orderNumber,
            status,
            orderTotal,
            items,
            extra,
          );
        }
      } else {
        this.logger.warn('No admin Telegram connections found');
      }
    } catch (adminErr: any) {
      this.logger.error(
        `Failed to send admin Telegram notification: ${adminErr?.message}`,
      );
    }

    return true;
  }

  // 7. Get user notifications
  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 8. Mark as read
  async markAsRead(userId: number, id: number) {
    const n = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!n) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // 9. Mark all as read
  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All marked as read' };
  }

  // 10. Get preferences
  async getPreferences(userId: number) {
    let prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return prefs;
  }

  // 11. Update preferences
  async updatePreferences(userId: number, dto: UpdatePreferencesDto) {
    const existing = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!existing) {
      return this.prisma.notificationPreference.create({
        data: { userId, ...dto },
      });
    }

    return this.prisma.notificationPreference.update({
      where: { userId },
      data: dto,
    });
  }
}