import { Test, TestingModule } from '@nestjs/testing';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

describe('StaffController', () => {
  let controller: StaffController;
  let service: StaffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        {
          provide: StaffService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            changeStatus: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StaffController>(StaffController);
    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service findAll with merged query', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({ page: 1, limit: 10 }, 1)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        companyId: 1,
      });
    });
  });
});
