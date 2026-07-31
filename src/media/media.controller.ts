import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Auth } from '../auth/decorators';
import { ActiveCompanyId } from '../common/decorators/active-company-id.decorator';
import {
  ApiUploadMedia,
  ApiDeleteMedia,
} from './decorators/media-swagger.decorators';
import { InvalidFileTypeException } from './exceptions/invalid-file-type.exception';
import { FileTooLargeException } from './exceptions/file-too-large.exception';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiUploadMedia()
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @ActiveCompanyId() companyId: number,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new InvalidFileTypeException(ALLOWED_MIME_TYPES.join(', '));
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooLargeException(5);
    }

    return this.mediaService.uploadImage(
      file,
      companyId.toString(),
      dto.folder,
    );
  }

  @Delete()
  @Auth()
  @ApiDeleteMedia()
  async delete(@Query('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('publicId query parameter is required');
    }
    return this.mediaService.deleteImage(publicId);
  }
}
