import 'multer';
import {
  Controller,
  Post,
  Get,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    this.validateImage(file);
    const url = this.uploadsService.saveFile(file, folder || 'general');
    return { url };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files at once');
    }

    const urls = files.map((file) => {
      this.validateImage(file);
      return this.uploadsService.saveFile(file, folder || 'general');
    });

    return { urls };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('stats')
  getStats() {
    return this.uploadsService.getStats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('list')
  listFiles(@Query('folder') folder: string) {
    if (!folder) throw new BadRequestException('Folder parameter required');
    return { files: this.uploadsService.listFiles(folder) };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('file')
  deleteFile(@Query('path') filePath: string) {
    if (!filePath) throw new BadRequestException('File path required');
    const deleted = this.uploadsService.deleteFile(filePath);
    return {
      success: deleted,
      message: deleted ? 'File deleted' : 'File not found',
    };
  }

  private validateImage(file: Express.Multer.File) {
  const allowedTypes = [
    // Common images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    // Modern formats
    'image/avif',
    'image/heic',
    'image/heif',
    // Add any image/* as fallback
  ];

  // Check MIME type
  const isImage =
    allowedTypes.includes(file.mimetype) ||
    file.mimetype.startsWith('image/');

  if (!isImage) {
    throw new BadRequestException(
      `Invalid file type. Please upload an image. Got: ${file.mimetype}`,
    );
  }

  // Max 10MB (increased for HEIC)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new BadRequestException(
      `File too large. Max 10MB. Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    );
  }

  // Max filename length
  if (file.originalname.length > 200) {
    throw new BadRequestException('Filename too long');
  }
}
}