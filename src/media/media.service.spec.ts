import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { BadRequestException } from '@nestjs/common';
import * as streamifier from 'streamifier';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

jest.mock('streamifier', () => ({
  createReadStream: jest.fn(),
}));

describe('MediaService', () => {
  let service: MediaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-vyma'),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should successfully upload an image to Cloudinary and return mapped response', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const companyUuid = 'company-uuid';
      const folder = 'news';

      const cloudinaryResponse = {
        public_id: 'test_public_id',
        secure_url: 'https://cloudinary.com/test.webp',
        format: 'webp',
        width: 1080,
        height: 720,
        bytes: 1000,
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, cloudinaryResponse);
          return { pipe: jest.fn() }; // mock stream
        },
      );

      const mockPipe = jest.fn();
      (streamifier.createReadStream as jest.Mock).mockReturnValue({
        pipe: mockPipe,
      });

      const result = await service.uploadImage(mockFile, companyUuid, folder);

      expect(result).toEqual({
        publicId: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
        format: cloudinaryResponse.format,
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height,
        bytes: cloudinaryResponse.bytes,
      });

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'test-vyma/company-uuid/news',
          format: 'webp',
        }),
        expect.any(Function),
      );
      expect(streamifier.createReadStream).toHaveBeenCalledWith(
        mockFile.buffer,
      );
      expect(mockPipe).toHaveBeenCalled();
    });

    it('should throw BadRequestException if upload fails', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(new Error('Upload failed'), null);
          return { pipe: jest.fn() };
        },
      );

      (streamifier.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      });

      await expect(service.uploadImage(mockFile, 'uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an image', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      });

      const result = await service.deleteImage('public-id');
      expect(result).toEqual({ success: true });
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('public-id');
    });

    it('should throw BadRequestException if delete fails', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
        new Error('Failed to delete'),
      );

      await expect(service.deleteImage('public-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
