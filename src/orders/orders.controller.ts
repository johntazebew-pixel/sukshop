import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Req, Query, Headers,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // PUBLIC — must be FIRST
  @Get('track/:trackingNumber')
  trackOrder(@Param('trackingNumber') trackingNumber: string) {
    return this.ordersService.trackOrder(trackingNumber);
  }

  // USER
  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.ordersService.createOrder(req.user.id, {
      ...dto,
      sessionId,
    } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  getUserOrders(@Req() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  getUserOrder(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.getUserOrder(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('my-orders/:id/cancel')
  cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.cancelOrder(req.user.id, id, dto);
  }

  // ADMIN
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ) {
    return this.ordersService.getAllOrders({ status, search });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/:id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, req.user.id);
  }
}