import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { BadRequestException } from '@nestjs/common';
import { InvalidFileTypeException } from './exceptions/invalid-file-type.exception';
import { FileTooLargeException } from './exceptions/file-too-large.exception';
import { UploadMediaDto } from './dto/upload-media.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  beforeEach(async () => {
    const mockMediaService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;
    const dto: UploadMediaDto = { folder: 'test' };
    const companyId = 1;

    it('should upload a file successfully', async () => {
      const expectedResponse = {
        publicId: 'id',
        url: 'url',
        format: 'webp',
        width: 100,
        height: 100,
        bytes: 100,
      };
      jest.spyOn(service, 'uploadImage').mockResolvedValue(expectedResponse);

      const result = await controller.upload(mockFile, dto, companyId);
      expect(result).toEqual(expectedResponse);
      expect(service.uploadImage).toHaveBeenCalledWith(
        mockFile,
        companyId.toString(),
        'test',
      );
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        controller.upload(
          undefined as unknown as Express.Multer.File,
          dto,
          companyId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InvalidFileTypeException if mimetype is wrong', async () => {
      const badFile = { ...mockFile, mimetype: 'application/pdf' };
      await expect(controller.upload(badFile, dto, companyId)).rejects.toThrow(
        InvalidFileTypeException,
      );
    });

    it('should throw FileTooLargeException if file exceeds limit', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 }; // 10MB
      await expect(
        controller.upload(largeFile, dto, companyId),
      ).rejects.toThrow(FileTooLargeException);
    });
  });

  describe('delete', () => {
    it('should delete a file successfully', async () => {
      jest.spyOn(service, 'deleteImage').mockResolvedValue({ success: true });
      const result = await controller.delete('public-id');
      expect(result).toEqual({ success: true });
      expect(service.deleteImage).toHaveBeenCalledWith('public-id');
    });

    it('should throw BadRequestException if publicId is missing', async () => {
      await expect(controller.delete('')).rejects.toThrow(BadRequestException);
    });
  });
});
