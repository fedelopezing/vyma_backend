import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger';
import { MediaResponseDto } from '../dto/media-response.dto';

export const ApiUploadMedia = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Upload media to Cloudinary',
      description:
        'Uploads an image, auto-converts to WebP, and scales to max 1080px',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Image file (Max 5MB)',
          },
          folder: {
            type: 'string',
            description: 'Optional subfolder within the company directory',
          },
        },
      },
    }),
    ApiOkResponse({
      type: MediaResponseDto,
      description: 'Media uploaded successfully',
    }),
    ApiBadRequestResponse({ description: 'Invalid file or file type' }),
    ApiPayloadTooLargeResponse({
      description: 'File size exceeds limit (5MB)',
    }),
  );

export const ApiDeleteMedia = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete media from Cloudinary' }),
    ApiOkResponse({ description: 'Media deleted successfully' }),
    ApiBadRequestResponse({ description: 'Failed to delete media' }),
  );
