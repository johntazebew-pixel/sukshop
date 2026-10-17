import {
  Controller,
  Patch,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Update current user's profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  // Change password
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@Req() req: any, @Body() body: any) {
    return this.usersService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  // ==========================================
  // ADMIN ONLY
  // ==========================================

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: 'CUSTOMER' | 'ADMIN' },
  ) {
    return this.usersService.updateRole(id, body.role);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/block')
  async toggleBlock(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleBlock(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}