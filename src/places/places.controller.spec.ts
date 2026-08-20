import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SearchPlaceDto } from './dto';

describe('PlacesController', () => {
  let controller: PlacesController;
  let mockService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockService = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlacesController>(PlacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call placesService.search and return result', async () => {
      const searchDto: SearchPlaceDto = { q: 'Asuncion' };
      const expectedResult = [{ lat: -25, lon: -57, displayName: 'Asuncion' }];

      mockService.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(mockService.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
