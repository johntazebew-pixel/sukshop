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
  Headers,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // 1. Get cart (guest or user)
  @Get()
  getCart(
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.getCart(userId, sessionId);
  }

  // 2. Add to cart
  @Post('add')
  addToCart(
    @Body() dto: AddToCartDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    const finalSessionId = dto.sessionId || sessionId;
    return this.cartService.addToCart(
      { ...dto, sessionId: finalSessionId },
      userId,
    );
  }

  // 3. Update quantity (guest + user)
  @Patch('item/:id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.updateItem(id, dto, userId, sessionId);
  }

  // 4. Remove item (guest + user)
  @Delete('item/:id')
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.removeItem(id, userId, sessionId);
  }

  // 5. Clear cart (guest + user)
  @Delete('clear')
  clearCart(
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.clearCart(userId, sessionId);
  }

  // 6. Merge guest cart (requires login)
  @UseGuards(JwtAuthGuard)
  @Post('merge')
  mergeCart(@Body('sessionId') sessionId: string, @Req() req: any) {
    return this.cartService.mergeGuestCart(sessionId, req.user.id);
  }
}