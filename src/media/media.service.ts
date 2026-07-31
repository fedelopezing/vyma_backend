import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { MediaResponseDto } from './dto/media-response.dto';
import { CloudinaryResponse } from './interfaces/cloudinary-response.interface';
import * as streamifier from 'streamifier';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly rootFolder: string;

  constructor(private readonly configService: ConfigService) {
    this.rootFolder =
      this.configService.get<string>('CLOUDINARY_ROOT_FOLDER') || 'vyma';
  }

  async uploadImage(
    file: Express.Multer.File,
    companyUuid: string,
    folder?: string,
  ): Promise<MediaResponseDto> {
    try {
      const destinationFolder = folder
        ? `${this.rootFolder}/${companyUuid}/${folder}`
        : `${this.rootFolder}/${companyUuid}`;

      const uploadResult = await new Promise<CloudinaryResponse>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: destinationFolder,
              format: 'webp',
              transformation: [
                { width: 1080, crop: 'limit' },
                { quality: 'auto' },
              ],
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result as CloudinaryResponse);
            },
          );

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        },
      );

      return {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading image to Cloudinary: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to upload image');
    }
  }

  async deleteImage(publicId: string): Promise<{ success: boolean }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: result.result === 'ok' };
    } catch (error) {
      this.logger.error(
        `Error deleting image from Cloudinary: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete image');
    }
  }
}
