import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getUserWishlist(@Req() req: any) {
    return this.wishlistService.getUserWishlist(req.user.id);
  }

  @Post('add/:productId')
  addToWishlist(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete('remove/:productId')
  removeFromWishlist(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }

  @Post('toggle/:productId')
  toggleWishlist(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.toggleWishlist(req.user.id, productId);
  }

  @Get('check/:productId')
  checkInWishlist(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.checkInWishlist(req.user.id, productId);
  }
}