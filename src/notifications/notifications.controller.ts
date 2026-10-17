import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==========================================
  // TELEGRAM
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Post('telegram/connect')
  connectTelegram(@Body() dto: ConnectTelegramDto, @Req() req: any) {
    return this.notificationsService.connectTelegram(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('telegram/disconnect')
  disconnectTelegram(@Req() req: any) {
    return this.notificationsService.disconnectTelegram(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('telegram/status')
  getTelegramStatus(@Req() req: any) {
    return this.notificationsService.getTelegramStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('telegram/test')
  testTelegram(@Req() req: any) {
    return this.notificationsService.testTelegram(req.user.id);
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserNotifications(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // ==========================================
  // PREFERENCES
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  getPreferences(@Req() req: any) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @Req() req: any,
  ) {
    return this.notificationsService.updatePreferences(req.user.id, dto);
  }

  // ==========================================
  // ADMIN — Send manual notification
  // ==========================================

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('send')
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send(dto);
  }
}