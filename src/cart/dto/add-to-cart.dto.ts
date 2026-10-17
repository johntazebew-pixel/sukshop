import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  sessionId?: string;
}