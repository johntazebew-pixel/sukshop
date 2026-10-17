import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Helper: get or create cart
  private async getOrCreateCart(userId?: number, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId is required');
    }

    if (userId) {
      let cart = await this.prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: { include: { images: true } },
              },
            },
          },
        });
      }

      return cart;
    }

    let cart = await this.prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
        },
      });
    }

    return cart;
  }

  // Calculate totals
  private calculateCart(cart: any) {
    const total = cart.items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.product.price) * item.quantity,
      0,
    );

    const itemCount = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );

    return { ...cart, total, itemCount };
  }

  async getCart(userId?: number, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.calculateCart(cart);
  }

  async addToCart(dto: AddToCartDto, userId?: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (!product.isActive)
      throw new BadRequestException('Product is not available');
    if (product.stock < dto.quantity)
      throw new BadRequestException(
        `Only ${product.stock} items available`,
      );

    const cart = await this.getOrCreateCart(userId, dto.sessionId);

    const existing = cart.items.find(
      (i) => i.productId === dto.productId,
    );

    if (existing) {
      const newQuantity = existing.quantity + dto.quantity;
      if (newQuantity > product.stock)
        throw new BadRequestException(
          `Only ${product.stock} items available`,
        );

      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      include: { product: true },
    });
  }

  async updateItem(
    itemId: number,
    dto: UpdateCartItemDto,
    userId?: number,
    sessionId?: string,
  ) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    const byUser = userId && item.cart.userId && item.cart.userId === userId;
    const bySession =
      sessionId && item.cart.sessionId && item.cart.sessionId === sessionId;

    if (!byUser && !bySession)
      throw new BadRequestException('Not your cart item');

    if (dto.quantity > item.product.stock)
      throw new BadRequestException(
        `Only ${item.product.stock} items in stock`,
      );

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

  async removeItem(itemId: number, userId?: number, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    const byUser = userId && item.cart.userId && item.cart.userId === userId;
    const bySession =
      sessionId && item.cart.sessionId && item.cart.sessionId === sessionId;

    if (!byUser && !bySession)
      throw new BadRequestException('Not your cart item');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  async clearCart(userId?: number, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return { message: 'Cart cleared' };
  }

  // 🎯 MERGE guest cart → user cart
  async mergeGuestCart(sessionId: string, userId: number) {
    console.log(`🔀 Merging session=${sessionId} → user=${userId}`);

    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      console.log('ℹ️ No guest cart to merge');
      return { message: 'No guest cart to merge', mergedItems: 0 };
    }

    console.log(`📦 Found ${guestCart.items.length} guest items`);

    let userCart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
      console.log(`✅ Created user cart id=${userCart.id}`);
    }

    let moved = 0;

    for (const item of guestCart.items) {
      const existing = userCart.items.find(
        (i) => i.productId === item.productId,
      );

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await this.prisma.cartItem.update({
          where: { id: item.id },
          data: { cartId: userCart.id },
        });
      }
      moved++;
    }

    await this.prisma.cart.delete({ where: { id: guestCart.id } });

    console.log(`✅ Merged ${moved} items`);

    return { message: 'Cart merged', mergedItems: moved };
  }
}