import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ==========================================
  // Helper: Generate unique order number
  // ==========================================
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    return `ORD-${year}${month}-${random}`;
  }

  // ==========================================
  // Helper: Load order with all details
  // ==========================================
  private async getOrderWithDetails(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            admin: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  // ==========================================
  // 1. CREATE ORDER (Checkout)
  // ==========================================
  async createOrder(
    userId: number,
    dto: CreateOrderDto & { sessionId?: string },
  ) {
    // 1. Try USER cart first
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    // 2. If empty, try GUEST cart using sessionId from header
    if ((!cart || cart.items.length === 0) && dto.sessionId) {
      console.log(`🔍 User cart empty, checking guest: ${dto.sessionId}`);

      const guestCart = await this.prisma.cart.findFirst({
        where: { sessionId: dto.sessionId },
        include: { items: { include: { product: true } } },
      });

      if (guestCart && guestCart.items.length > 0) {
        console.log(`📦 Found guest cart with ${guestCart.items.length} items`);

        // Create user cart if missing
        if (!cart) {
          cart = await this.prisma.cart.create({
            data: { userId },
            include: { items: { include: { product: true } } },
          });
        }

        // Move each guest item to user cart
        for (const item of guestCart.items) {
          const existing = cart.items.find(
            (i) => i.productId === item.productId,
          );

          if (existing) {
            // Merge quantities
            await this.prisma.cartItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + item.quantity },
            });
          } else {
            // Move item to user cart
            await this.prisma.cartItem.update({
              where: { id: item.id },
              data: { cartId: cart.id },
            });
          }
        }

        // Delete the empty guest cart
        await this.prisma.cart.delete({ where: { id: guestCart.id } });

        // Reload user cart
        cart = await this.prisma.cart.findFirst({
          where: { userId },
          include: { items: { include: { product: true } } },
        });

        console.log(`✅ Merged. Cart now has ${cart?.items.length} items`);
      }
    }

    // 3. Still empty? Throw error
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // 4. Validate stock for each item
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(
          `"${item.product.name}" is no longer available`,
        );
      }
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for "${item.product.name}". Only ${item.product.stock} available`,
        );
      }
    }

    // 5. Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    // 6. Build address string
    const shippingAddress = [
      dto.fullName,
      dto.phone,
      dto.city,
      dto.street,
      dto.postalCode,
    ]
      .filter(Boolean)
      .join(', ');

    // 7. Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          status: 'PENDING',
          total,
          shippingAddress,
          phone: dto.phone,
          paymentMethod: 'Cash on Delivery',
          notes: dto.notes,
          items: {
            create: cart!.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Reduce stock
      for (const item of cart!.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart!.id },
      });

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING',
          note: 'Order placed successfully',
        },
      });

      return newOrder;
    });

    // 8. Send Telegram notification (non-blocking)
    this.notifications
      .sendOrderUpdate(userId, order.orderNumber, 'PENDING', Number(total), {
        orderId: order.id,
      })
      .catch((err) => console.error('Notification failed:', err));

    return this.getOrderWithDetails(order.id);
  }

  // ==========================================
  // 2. GET USER'S ORDERS
  // ==========================================
  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // 3. GET ONE USER ORDER
  // ==========================================
  async getUserOrder(userId: number, orderId: number) {
    const order = await this.getOrderWithDetails(orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException('Not your order');
    }

    return order;
  }

  // ==========================================
  // 4. GET ALL ORDERS (Admin)
  // ==========================================
  async getAllOrders(filters?: { status?: any; search?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        {
          shippingAddress: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // 5. GET ONE ORDER (Admin)
  // ==========================================
  async getOrderById(orderId: number) {
    return this.getOrderWithDetails(orderId);
  }

  // ==========================================
  // 6. UPDATE ORDER STATUS (Admin)
  // ==========================================
  async updateOrderStatus(
    orderId: number,
    dto: UpdateOrderStatusDto,
    adminId: number,
  ) {
    const order = await this.getOrderWithDetails(orderId);
    const currentStatus: string = order.status;

    if (currentStatus === 'CANCELLED') {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    if (currentStatus === 'DELIVERED' && dto.status !== 'DELIVERED') {
      throw new BadRequestException('Cannot change delivered order status');
    }

    const updateData: any = { status: dto.status };

    if (dto.trackingNumber) updateData.trackingNumber = dto.trackingNumber;
    if (dto.courierName) updateData.courierName = dto.courierName;
    if (dto.estimatedDelivery)
      updateData.estimatedDelivery = new Date(dto.estimatedDelivery);
    if (dto.refundStatus) updateData.refundStatus = dto.refundStatus;

    if (dto.status === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (dto.status === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    // Handle CANCELLED: restore stock
    if (dto.status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = dto.note || 'Cancelled by admin';

      if (currentStatus !== 'CANCELLED') {
        await this.prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });
      }
    }

    // Update order + history
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status,
          note: dto.note || `Status changed to ${dto.status}`,
          changedBy: adminId,
        },
      });
    });

    // Notify
    this.notifications
      .sendOrderUpdate(
        order.userId,
        order.orderNumber,
        dto.status,
        Number(order.total),
        {
          orderId,
          note: dto.note,
          trackingNumber: dto.trackingNumber,
          courierName: dto.courierName,
        },
      )
      .catch((err) => console.error('Status notification failed:', err));

    return this.getOrderWithDetails(orderId);
  }

  // ==========================================
  // 7. CANCEL ORDER (User)
  // ==========================================
  async cancelOrder(userId: number, orderId: number, dto: CancelOrderDto) {
    const order = await this.getOrderWithDetails(orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException('Not your order');
    }

    const currentStatus: string = order.status;

    if (currentStatus !== 'PENDING' && currentStatus !== 'CONFIRMED') {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: dto.reason || 'Cancelled by user',
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CANCELLED',
          note: dto.reason || 'Cancelled by user',
        },
      });
    });

    this.notifications
      .sendOrderUpdate(
        userId,
        order.orderNumber,
        'CANCELLED',
        Number(order.total),
        {
          orderId,
          note: dto.reason || 'Cancelled by user',
        },
      )
      .catch((err) => console.error('Cancel notification failed:', err));

    return this.getOrderWithDetails(orderId);
  }

  // ==========================================
  // 8. TRACK ORDER (Public)
  // ==========================================
  async trackOrder(query: string) {
    const trimmed = query?.trim();

    if (!trimmed) {
      throw new BadRequestException('Tracking number is required');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ trackingNumber: trimmed }, { orderNumber: trimmed }],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('No order found');
    }

    // Mask name
    const customerName = order.user?.name || 'Customer';
    const nameParts = customerName.trim().split(/\s+/);
    const maskedName =
      nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1].charAt(0).toUpperCase()}.`
        : nameParts[0];

    // City only
    const addressParts = order.shippingAddress
      .split(',')
      .map((s) => s.trim());
    const cityOnly =
      addressParts.length >= 3 ? addressParts[2] : 'Ethiopia';

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      total: order.total,
      customerName: maskedName,
      destinationCity: cityOnly,
      itemCount: order.items.length,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        imageUrl: item.product?.images?.[0]?.url || null,
      })),
      timeline: order.statusHistory.map((h) => ({
        status: h.status,
        note: h.note,
        date: h.createdAt,
      })),
    };
  }

  // ==========================================
  // 9. DASHBOARD STATS (Admin)
  // ==========================================
  async getStats() {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true },
      }),
    ]);

    return {
      totalOrders,
      byStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      totalRevenue: Number(totalRevenue._sum.total) || 0,
    };
  }
}