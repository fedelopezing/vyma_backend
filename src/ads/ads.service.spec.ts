import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { AdsService } from './ads.service';
import { Ad } from './entities/ad.entity';
import { IAdRepository } from './interfaces/i-ad-repository.interface';
import { AD_REPOSITORY } from './constants/ads.constants';
import { AdNotFoundException } from './exceptions/ad-not-found.exception';
import { CreateAdDto, UpdateAdDto, AdsPaginationDto } from './dto';

describe('AdsService', () => {
  let service: AdsService;
  let mockAdRepository: DeepMocked<IAdRepository>;
  let mockEventEmitter: DeepMocked<EventEmitter2>;

  const mockAd = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    imageUrlEs: 'https://cloudinary.com/image-es.jpg',
    imageUrlEn: 'https://cloudinary.com/image-en.jpg',
    isActive: true,
    order: 1,
    companyId: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Ad;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockAdRepository = createMock<IAdRepository>();
    mockEventEmitter = createMock<EventEmitter2>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdsService,
        { provide: AD_REPOSITORY, useValue: mockAdRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AdsService>(AdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findActive', () => {
    it('debería retornar la lista de banners activos de una empresa', async () => {
      mockAdRepository.findActiveByCompany.mockResolvedValue([mockAd]);

      const result = await service.findActive(10);

      expect(result).toEqual([mockAd]);
      expect(mockAdRepository.findActiveByCompany).toHaveBeenCalledWith(10);
    });
  });

  describe('findAllAdmin', () => {
    it('debería retornar la paginación de anuncios del panel de administración', async () => {
      const paginationDto: AdsPaginationDto = { page: 1, limit: 10 };
      mockAdRepository.findPaginated.mockResolvedValue([[mockAd], 1]);

      const result = await service.findAllAdmin(paginationDto, 10);

      expect(result.data).toEqual([mockAd]);
      expect(result.meta.total).toBe(1);
      expect(mockAdRepository.findPaginated).toHaveBeenCalledWith(
        paginationDto,
        10,
      );
    });
  });

  describe('create', () => {
    it('debería crear un anuncio y emitir el evento ad.created', async () => {
      const dto: CreateAdDto = {
        imageUrlEs: 'https://cloudinary.com/image-es.jpg',
        isActive: true,
      };
      mockAdRepository.create.mockResolvedValue(mockAd);

      const result = await service.create(dto, 10);

      expect(result).toEqual(mockAd);
      expect(mockAdRepository.create).toHaveBeenCalledWith(dto, 10);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('ad.created', {
        adId: mockAd.id,
        companyId: mockAd.companyId,
      });
    });
  });

  describe('update', () => {
    it('debería actualizar un anuncio existente y emitir el evento ad.updated', async () => {
      const dto: UpdateAdDto = { order: 2 };
      mockAdRepository.findOneById.mockResolvedValue(mockAd);
      mockAdRepository.update.mockResolvedValue({ ...mockAd, order: 2 } as Ad);

      const result = await service.update(mockAd.id, dto, mockAd.companyId);

      expect(result.order).toBe(2);
      expect(mockAdRepository.findOneById).toHaveBeenCalledWith(mockAd.id);
      expect(mockAdRepository.update).toHaveBeenCalledWith(mockAd, dto);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('ad.updated', {
        adId: mockAd.id,
        companyId: mockAd.companyId,
      });
    });

    it('debería lanzar AdNotFoundException si el anuncio no existe', async () => {
      mockAdRepository.findOneById.mockResolvedValue(null);

      await expect(service.update('fake-id', {}, 10)).rejects.toThrow(
        AdNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar lógicamente un anuncio y emitir el evento ad.deleted', async () => {
      mockAdRepository.findOneById.mockResolvedValue(mockAd);
      mockAdRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(mockAd.id, mockAd.companyId);

      expect(mockAdRepository.findOneById).toHaveBeenCalledWith(mockAd.id);
      expect(mockAdRepository.softDelete).toHaveBeenCalledWith(mockAd.id);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('ad.deleted', {
        adId: mockAd.id,
        companyId: mockAd.companyId,
      });
    });

    it('debería lanzar AdNotFoundException si el anuncio a eliminar no existe', async () => {
      mockAdRepository.findOneById.mockResolvedValue(null);

      await expect(service.remove('fake-id', 10)).rejects.toThrow(
        AdNotFoundException,
      );
    });
  });
});
