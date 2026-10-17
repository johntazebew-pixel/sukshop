import { IsString, MinLength, IsOptional } from 'class-validator';

export class ConnectTelegramDto {
  @IsString()
  @MinLength(5)
  chatId: string;

  @IsString()
  @MinLength(2)
  telegramUsername: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string; // 🆕 Optional phone number
}