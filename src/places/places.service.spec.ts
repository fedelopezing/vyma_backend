import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { PLACES_PROVIDER } from './interfaces/i-places-provider.interface';
import { SearchPlaceDto } from './dto';

describe('PlacesService', () => {
  let service: PlacesService;
  let mockProvider: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockProvider = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: PLACES_PROVIDER,
          useValue: mockProvider,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should call provider.search with correct parameters', async () => {
      const dto: SearchPlaceDto = { q: 'Test Place', limit: 3 };
      const expectedResult = [{ lat: 1, lon: 2, displayName: 'Test' }];

      mockProvider.search.mockResolvedValue(expectedResult);

      const result = await service.search(dto);

      expect(mockProvider.search).toHaveBeenCalledWith('Test Place', 3);
      expect(result).toEqual(expectedResult);
    });

    it('should use default limit if not provided', async () => {
      const dto: SearchPlaceDto = { q: 'Test Place' };

      mockProvider.search.mockResolvedValue([]);

      await service.search(dto);

      expect(mockProvider.search).toHaveBeenCalledWith('Test Place', 5);
    });

    it('should rethrow error when provider fails', async () => {
      const dto: SearchPlaceDto = { q: 'Test Place' };
      mockProvider.search.mockRejectedValue(new Error('Provider Error'));

      await expect(service.search(dto)).rejects.toThrow('Provider Error');
    });
  });
});
