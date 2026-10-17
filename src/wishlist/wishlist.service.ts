import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getUserWishlist(userId: number) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            subcategory: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToWishlist(userId: number, productId: number) {
    // Check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if already in wishlist
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    if (existing) {
      throw new ConflictException('Already in wishlist');
    }

    return this.prisma.wishlist.create({
      data: { userId, productId },
      include: {
        product: { include: { images: true } },
      },
    });
  }

  async removeFromWishlist(userId: number, productId: number) {
    const item = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    if (!item) {
      throw new NotFoundException('Not in wishlist');
    }

    await this.prisma.wishlist.delete({
      where: { id: item.id },
    });

    return { message: 'Removed from wishlist' };
  }

  async toggleWishlist(userId: number, productId: number) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      return { added: false, message: 'Removed from wishlist' };
    }

    await this.prisma.wishlist.create({
      data: { userId, productId },
    });
    return { added: true, message: 'Added to wishlist' };
  }

  async checkInWishlist(userId: number, productId: number) {
    const item = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    return { inWishlist: !!item };
  }
}