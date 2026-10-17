import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface Setting {
  id: number;
  key: string;
  value: string;
  updatedAt: Date;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.setting.findMany();
    return settings.reduce(
      (acc: Record<string, string>, item: Setting) => ({
        ...acc,
        [item.key]: item.value,
      }),
      {} as Record<string, string>,
    );
  }

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return setting;
  }

  async upsert(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async updateMany(settings: Record<string, string>) {
    const operations = Object.entries(settings).map(([key, value]) =>
      this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );
    await this.prisma.$transaction(operations);
    return this.getAll();
  }

  async remove(key: string) {
    await this.get(key);
    await this.prisma.setting.delete({ where: { key } });
    return { message: 'Setting deleted successfully' };
  }
}