import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        titleEn: dto.titleEn,
        titleAm: dto.titleAm,
        subtitleEn: dto.subtitleEn,
        subtitleAm: dto.subtitleAm,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner #${id} not found`);
    return banner;
  }

  async update(id: number, dto: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner deleted successfully' };
  }
}