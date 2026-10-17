import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // PUBLIC — ሁሉንም ቅንብሮች ያግኙ
  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  // PUBLIC — አንድ ቅንብር
  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  // ADMIN — ቅንብር ያዘምኑ
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  upsert(@Body() body: { key: string; value: string }) {
    return this.settingsService.upsert(body.key, body.value);
  }

  // ADMIN — ብዙ ቅንብሮች በአንድ ጊዜ
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('bulk')
  updateMany(@Body() body: Record<string, string>) {
    return this.settingsService.updateMany(body);
  }

  // ADMIN — ቅንብር ያጥፉ
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}