import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const sanitizeFilename = (filename: string): string =>
  filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');

@Controller('photos')
export class PhotosController {
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname);
          const baseName = sanitizeFilename(
            file.originalname.replace(extension, ''),
          );
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('File is required');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return {
      message: 'Files uploaded successfully',
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`,
        url: `${baseUrl}/uploads/${file.filename}`,
      })),
    };
  }
}
