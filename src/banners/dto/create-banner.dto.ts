import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  titleEn: string;

  @IsString()
  titleAm: string;

  @IsOptional()
  @IsString()
  subtitleEn?: string;

  @IsOptional()
  @IsString()
  subtitleAm?: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}