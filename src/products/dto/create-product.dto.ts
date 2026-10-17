import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nameAm: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  slug: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  descriptionAm?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  sku: string;

  @IsInt()
  subcategoryId: number;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  screenSize?: string;

  @IsOptional()
  @IsString()
  battery?: string;

  @IsOptional()
  @IsString()
  camera?: string;

  // ==========================================
  // IMAGES — Accept any string URLs
  // ==========================================
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}