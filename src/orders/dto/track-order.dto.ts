import { IsString, MinLength, MaxLength } from 'class-validator';

export class TrackOrderDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  trackingNumber: string;
}