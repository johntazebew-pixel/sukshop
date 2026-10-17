import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly baseUploadDir: string;

  // Allowed image extensions
  private readonly allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.bmp',
    '.svg',
    '.tiff',
    '.tif',
    '.avif',
    '.heic',
    '.heif',
    '.ico',
  ];

  // MIME type → extension map (fallback if originalname has no ext)
  private readonly mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/svg+xml': '.svg',
    'image/tiff': '.tiff',
    'image/avif': '.avif',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'image/x-icon': '.ico',
    'image/vnd.microsoft.icon': '.ico',
  };

  constructor() {
    this.baseUploadDir = path.join(process.cwd(), 'uploads');

    // Ensure base uploads folder exists
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
      this.logger.log(`📁 Created uploads folder: ${this.baseUploadDir}`);
    }
  }

  // ==========================================
  // 1. SAVE FILE
  // Generates a CLEAN filename — NO spaces, NO special chars
  // ==========================================
  saveFile(file: Express.Multer.File, folder: string = 'general'): string {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // Sanitize folder — lowercase, alphanumeric + dash + underscore only
    const safeFolder =
      folder.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'general';

    const folderPath = path.join(this.baseUploadDir, safeFolder);

    // Create subfolder if missing
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      this.logger.log(`📁 Created subfolder: ${folderPath}`);
    }

    // Determine extension
    let ext = path.extname(file.originalname || '').toLowerCase();

    // If no extension or unknown → derive from MIME type
    if (!ext || !this.allowedExtensions.includes(ext)) {
      ext = this.mimeToExt[file.mimetype] || '.jpg';
    }

    // Normalize .jpeg → .jpg
    if (ext === '.jpeg') ext = '.jpg';

    // ⚠️ CRITICAL: Generate CLEAN filename — no spaces, no unicode, no special chars
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `${timestamp}-${random}${ext}`;

    const filepath = path.join(folderPath, filename);

    // Write file to disk
    try {
      fs.writeFileSync(filepath, file.buffer);
      this.logger.log(`✅ Saved: /uploads/${safeFolder}/${filename}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to save: ${error.message}`);
      throw new BadRequestException('Failed to save file');
    }

    // Return public URL path
    return `/uploads/${safeFolder}/${filename}`;
  }

  // ==========================================
  // 2. DELETE FILE
  // ==========================================
  deleteFile(relativePath: string): boolean {
    if (!relativePath || typeof relativePath !== 'string') return false;

    // Remove leading slash
    const cleanPath = relativePath.startsWith('/')
      ? relativePath.substring(1)
      : relativePath;

    const filepath = path.join(process.cwd(), cleanPath);

    // Security check — must be inside uploads folder
    if (!filepath.startsWith(this.baseUploadDir)) {
      this.logger.warn(`🚫 Blocked delete outside uploads: ${filepath}`);
      return false;
    }

    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        this.logger.log(`🗑️ Deleted: ${relativePath}`);
        return true;
      }
      this.logger.warn(`⚠️ File not found: ${filepath}`);
      return false;
    } catch (error: any) {
      this.logger.error(`❌ Delete failed: ${error.message}`);
      return false;
    }
  }

  // ==========================================
  // 3. LIST FILES IN FOLDER
  // ==========================================
  listFiles(folder: string): string[] {
    const safeFolder = (folder || '').replace(/[^a-z0-9-_]/gi, '').toLowerCase();
    const folderPath = path.join(this.baseUploadDir, safeFolder);

    if (!fs.existsSync(folderPath)) {
      return [];
    }

    try {
      return fs
        .readdirSync(folderPath)
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return this.allowedExtensions.includes(ext);
        })
        .map((file) => `/uploads/${safeFolder}/${file}`);
    } catch (error: any) {
      this.logger.error(`Failed to list files: ${error.message}`);
      return [];
    }
  }

  // ==========================================
  // 4. GET STORAGE STATS
  // ==========================================
  getStats(): Record<string, { count: number; size: number; sizeMB: string }> {
    const folders = ['products', 'categories', 'logos', 'banners', 'general'];
    const stats: Record<
      string,
      { count: number; size: number; sizeMB: string }
    > = {};

    for (const folder of folders) {
      const folderPath = path.join(this.baseUploadDir, folder);
      let count = 0;
      let size = 0;

      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        count = files.length;

        for (const file of files) {
          try {
            const stat = fs.statSync(path.join(folderPath, file));
            size += stat.size;
          } catch {}
        }
      }

      stats[folder] = {
        count,
        size,
        sizeMB: (size / 1024 / 1024).toFixed(2),
      };
    }

    return stats;
  }

  // ==========================================
  // 5. CHECK IF FILE EXISTS
  // ==========================================
  fileExists(relativePath: string): boolean {
    if (!relativePath) return false;

    const cleanPath = relativePath.startsWith('/')
      ? relativePath.substring(1)
      : relativePath;

    const filepath = path.join(process.cwd(), cleanPath);
    return fs.existsSync(filepath);
  }

  // ==========================================
  // 6. CLEANUP ORPHANED FILES (optional)
  // ==========================================
  async cleanupOrphans(): Promise<number> {
    let deleted = 0;
    const folders = ['products', 'categories', 'logos', 'banners', 'general'];

    for (const folder of folders) {
      const folderPath = path.join(this.baseUploadDir, folder);

      if (!fs.existsSync(folderPath)) continue;

      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const filepath = path.join(folderPath, file);

        try {
          const stat = fs.statSync(filepath);

          // Delete files older than 30 days that are 0 bytes
          const isOld = Date.now() - stat.mtimeMs > 30 * 24 * 60 * 60 * 1000;
          if (isOld && stat.size === 0) {
            fs.unlinkSync(filepath);
            deleted++;
          }
        } catch {}
      }
    }

    if (deleted > 0) {
      this.logger.log(`🧹 Cleaned up ${deleted} orphaned files`);
    }

    return deleted;
  }
}