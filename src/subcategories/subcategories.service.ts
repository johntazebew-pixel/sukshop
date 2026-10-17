import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubcategoryDto) {
    const existing = await this.prisma.subcategory.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Subcategory with this slug already exists');
    }

    // Category መኖሩን ያረጋግጡ
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    return this.prisma.subcategory.create({
      data: {
        name: dto.name,
        nameAm: dto.nameAm,
        slug: dto.slug,
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.subcategory.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByCategory(categoryId: number) {
    return this.prisma.subcategory.findMany({
      where: { categoryId, isActive: true },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true,
        products: { where: { isActive: true } },
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    return subcategory;
  }

  async update(id: number, dto: UpdateSubcategoryDto) {
    await this.findOne(id);

    return this.prisma.subcategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.subcategory.delete({ where: { id } });
    return { message: 'Subcategory deleted successfully' };
  }
}