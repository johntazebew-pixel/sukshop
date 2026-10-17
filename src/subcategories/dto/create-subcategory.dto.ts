import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nameAm: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}