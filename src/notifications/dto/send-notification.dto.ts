import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { NotificationChannel, NotificationType } from '@prisma/client';

export class SendNotificationDto {
  @IsInt()
  userId: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  title: string;

  @IsString()
  message: string;
}