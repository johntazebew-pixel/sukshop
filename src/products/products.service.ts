import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // Helper: Parse and validate images array
  // ==========================================
  private parseImages(images: any): string[] {
    if (!images) return [];

    // Already an array of strings
    if (Array.isArray(images)) {
      return images.filter(
        (url) => typeof url === 'string' && url.trim().length > 0,
      );
    }

    // Comma-separated string
    if (typeof images === 'string') {
      return images
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }

    return [];
  }

  // ==========================================
  // Helper: Validate file extension
  // ==========================================
  private isAllowedImageUrl(url: string): boolean {
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.svg',
      '.bmp',
      '.avif',
      '.heic',
      '.heif',
      '.tiff',
      '.tif',
      '.ico',
    ];

    // Allow http/https URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }

    // Check extension for local paths
    const lower = url.toLowerCase();
    return allowedExtensions.some((ext) => lower.includes(ext));
  }

  // ==========================================
  // 1. CREATE PRODUCT
  // ==========================================
  async create(dto: any) {
    // 1. Check slug uniqueness
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Product with this slug already exists');
    }

    // 2. Verify subcategory exists
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id: Number(dto.subcategoryId) },
    });

    if (!subcategory) {
      throw new NotFoundException(
        `Subcategory with ID ${dto.subcategoryId} not found`,
      );
    }

    // 3. Parse and filter images
    const images = this.parseImages(dto.images).filter((url) =>
      this.isAllowedImageUrl(url),
    );

    // 4. Build product data (exclude images and any non-column fields)
    const {
      images: _images,
      subcategory: _sub,
      reviews: _rev,
      wishlists: _wish,
      cartItems: _cart,
      orderItems: _ord,
      ...productData
    } = dto;

    // 5. Create product with images
    return this.prisma.product.create({
      data: {
        name: productData.name,
        nameAm: productData.nameAm,
        slug: productData.slug,
        description: productData.description,
        descriptionAm: productData.descriptionAm || productData.description,
        price: Number(productData.price),
        oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
        stock: Number(productData.stock) || 0,
        sku: productData.sku,
        subcategoryId: Number(productData.subcategoryId),
        storage: productData.storage || null,
        color: productData.color || null,
        ram: productData.ram || null,
        screenSize: productData.screenSize || null,
        battery: productData.battery || null,
        camera: productData.camera || null,
        isActive:
          productData.isActive !== undefined ? productData.isActive : true,
        isFeatured:
          productData.isFeatured !== undefined
            ? productData.isFeatured
            : false,
        // Create images if any
        images:
          images.length > 0
            ? {
                create: images.map((url, index) => ({
                  url,
                  isMain: index === 0,
                })),
              }
            : undefined,
      },
      include: {
        images: true,
        subcategory: {
          include: { category: true },
        },
      },
    });
  }

  // ==========================================
  // 2. GET ALL PRODUCTS (with filters)
  // ==========================================
  async findAll(query: any = {}) {
    const where: any = { isActive: true };

    // Subcategory filter
    if (query.subcategoryId) {
      where.subcategoryId = Number(query.subcategoryId);
    }

    // Featured only
    if (query.featured === 'true' || query.featured === true) {
      where.isFeatured = true;
    }

    // Search (EN + AM)
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameAm: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { descriptionAm: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Price range
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    // In stock only
    if (query.inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Sort
    const orderBy: any = {};
    switch (query.sort) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'name_asc':
        orderBy.name = 'asc';
        break;
      case 'name_desc':
        orderBy.name = 'desc';
        break;
      case 'popular':
        orderBy.orderItems = { _count: 'desc' };
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    return this.prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        subcategory: {
          include: { category: true },
        },
      },
      orderBy,
    });
  }

  // ==========================================
  // 3. GET ONE PRODUCT (by ID)
  // ==========================================
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        subcategory: {
          include: { category: true },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  // ==========================================
  // 4. GET ONE PRODUCT (by slug)
  // ==========================================
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        subcategory: {
          include: { category: true },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  // ==========================================
  // 5. UPDATE PRODUCT
  // ==========================================
  async update(id: number, dto: any) {
    // 1. Verify product exists
    await this.findOne(id);

    // 2. Check slug uniqueness (if changing)
    if (dto.slug) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    // 3. Check subcategory (if changing)
    if (dto.subcategoryId) {
      const sub = await this.prisma.subcategory.findUnique({
        where: { id: Number(dto.subcategoryId) },
      });
      if (!sub) {
        throw new NotFoundException(
          `Subcategory with ID ${dto.subcategoryId} not found`,
        );
      }
    }

    // 4. Parse images if provided
    const images = dto.images !== undefined
      ? this.parseImages(dto.images).filter((url) =>
          this.isAllowedImageUrl(url),
        )
      : undefined;

    // 5. Extract relation fields (do not pass to update)
    const {
      images: _images,
      subcategory: _sub,
      reviews: _rev,
      wishlists: _wish,
      cartItems: _cart,
      orderItems: _ord,
      id: _id,
      createdAt: _created,
      updatedAt: _updated,
      ...productData
    } = dto;

    // 6. If images changed → replace them
    if (images !== undefined) {
      // Delete old images
      await this.prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Update with new images
      return this.prisma.product.update({
        where: { id },
        data: {
          ...productData,
          price: productData.price ? Number(productData.price) : undefined,
          oldPrice: productData.oldPrice
            ? Number(productData.oldPrice)
            : undefined,
          stock:
            productData.stock !== undefined
              ? Number(productData.stock)
              : undefined,
          subcategoryId: productData.subcategoryId
            ? Number(productData.subcategoryId)
            : undefined,
          images:
            images.length > 0
              ? {
                  create: images.map((url, index) => ({
                    url,
                    isMain: index === 0,
                  })),
                }
              : undefined,
        },
        include: {
          images: {
            orderBy: { isMain: 'desc' },
          },
          subcategory: {
            include: { category: true },
          },
        },
      });
    }

    // 7. No image changes — regular update
    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        price: productData.price ? Number(productData.price) : undefined,
        oldPrice: productData.oldPrice
          ? Number(productData.oldPrice)
          : undefined,
        stock:
          productData.stock !== undefined
            ? Number(productData.stock)
            : undefined,
        subcategoryId: productData.subcategoryId
          ? Number(productData.subcategoryId)
          : undefined,
      },
      include: {
        images: {
          orderBy: { isMain: 'desc' },
        },
        subcategory: {
          include: { category: true },
        },
      },
    });
  }

  // ==========================================
  // 6. DELETE PRODUCT
  // ==========================================
  async remove(id: number) {
    await this.findOne(id);

    // Delete related records first (cascade should handle, but explicit for safety)
    await this.prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await this.prisma.product.delete({ where: { id } });

    return { message: 'Product deleted successfully' };
  }

  // ==========================================
  // 7. UPDATE STOCK ONLY
  // ==========================================
  async updateStock(id: number, stock: number) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { stock: Number(stock) },
    });
  }

  // ==========================================
  // 8. TOGGLE ACTIVE STATUS
  // ==========================================
  async toggleActive(id: number) {
    const product = await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
  }

  // ==========================================
  // 9. TOGGLE FEATURED STATUS
  // ==========================================
  async toggleFeatured(id: number) {
    const product = await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
    });
  }

  // ==========================================
  // 10. GET PRODUCT STATS (Admin)
  // ==========================================
  async getStats() {
    const [total, active, featured, outOfStock, lowStock] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isFeatured: true } }),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.product.count({
        where: { stock: { gt: 0, lt: 5 } },
      }),
    ]);

    return {
      total,
      active,
      featured,
      outOfStock,
      lowStock,
    };
  }
}