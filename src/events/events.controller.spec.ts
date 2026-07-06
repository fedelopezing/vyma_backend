import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, EventsPaginationDto } from './dto';
import { Event, EventOrganizer, EventStatus } from './entities/event.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { UserCompanyRepository } from '../companies/repositories/user-company.repository';
import { CompaniesRepository } from '../companies/repositories/companies.repository';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: jest.Mocked<EventsService>;

  const mockEventsService: jest.Mocked<Partial<EventsService>> = {
    findAll: jest.fn(),
    findAllAdmin: jest.fn(),
    findOneBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEvent: Partial<Event> = {
    id: 'uuid-123',
    tituloEs: 'Evento de prueba',
    tituloEn: 'Test Event',
    resumenEs: 'Resumen',
    resumenEn: 'Summary',
    contenidoEs: '<p>Contenido</p>',
    contenidoEn: '<p>Content</p>',
    imagenPortada: 'https://cloudinary.com/event.jpg',
    fechaEvento: new Date('2025-10-15T19:00:00-04:00'),
    organizador: EventOrganizer.CCPS,
    estado: EventStatus.PUBLICADO,
    slugEs: 'evento-de-prueba',
    slugEn: 'test-event',
    companyId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtPayload: JwtPayload = {
    sub: 1,
    uuid: 'user-uuid-123',
    email: 'test@example.com',
    role: 'admin',
    companyId: 2,
    companyUuid: 'company-uuid-123',
    isSuperAdmin: false,
  };

  const mockAuthenticatedRequest = {
    companyId: 2,
    user: mockJwtPayload,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsService },
        {
          provide: UserCompanyRepository,
          useValue: { isActiveMember: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: CompaniesRepository,
          useValue: {
            findByUuid: jest.fn().mockResolvedValue({ id: 2, isActive: true }),
          },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(ModuleAccessGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get(EventsService) as jest.Mocked<EventsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllAdmin', () => {
    it('debería retornar eventos mapeados a EventResponseDto para admin', async () => {
      const paginationDto: EventsPaginationDto = { page: 1, limit: 10 };
      const serviceResponse = {
        data: [mockEvent as Event],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      eventsService.findAllAdmin.mockResolvedValueOnce(serviceResponse);

      const result = await controller.findAllAdmin(
        paginationDto,
        2, // companyId 2 from mockAuthenticatedRequest
      );

      expect(result.data[0].id).toBe(mockEvent.id);
      expect(result.data[0].tituloEs).toBe(mockEvent.tituloEs);
      expect(result.data[0]).not.toHaveProperty('autor'); // Excluded in EventResponseDto
      expect(eventsService.findAllAdmin).toHaveBeenCalledWith(
        paginationDto,
        mockJwtPayload.companyId,
      );
    });

    it('debería permitir filtrar por companyId para superadmin', async () => {
      const paginationDto: EventsPaginationDto = {
        page: 1,
        limit: 10,
        companyId: 5,
      };

      eventsService.findAllAdmin.mockResolvedValueOnce({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await controller.findAllAdmin(paginationDto, 5);

      expect(eventsService.findAllAdmin).toHaveBeenCalledWith(paginationDto, 5);
    });
  });

  describe('create', () => {
    it('debería crear un evento y retornar EventResponseDto', async () => {
      const createDto: CreateEventDto = {
        tituloEs: 'Evento de prueba',
        resumenEs: 'Resumen',
        contenidoEs: '<p>Contenido</p>',
        imagenPortada: 'https://cloudinary.com/event.jpg',
        fechaEvento: '2025-10-15T19:00:00-04:00',
        organizador: EventOrganizer.CCPS,
        estado: EventStatus.PUBLICADO,
      };

      eventsService.create.mockResolvedValueOnce(mockEvent as Event);

      const result = await controller.create(
        createDto,
        mockAuthenticatedRequest as never,
      );

      expect(result.id).toBe(mockEvent.id);
      expect(eventsService.create).toHaveBeenCalledWith(
        createDto,
        '1',
        mockJwtPayload.companyId,
      );
    });
  });

  describe('update', () => {
    it('debería actualizar el evento y retornar EventResponseDto', async () => {
      const updateDto: UpdateEventDto = { tituloEs: 'Nuevo titulo' };
      eventsService.update.mockResolvedValueOnce({
        ...mockEvent,
        tituloEs: 'Nuevo titulo',
      } as Event);

      const result = await controller.update(
        'uuid-123',
        updateDto,
        mockAuthenticatedRequest as never,
      );

      expect(result.tituloEs).toBe('Nuevo titulo');
      expect(eventsService.update).toHaveBeenCalledWith('uuid-123', updateDto, {
        companyId: 2,
        isSuperAdmin: false,
      });
    });
  });

  describe('remove', () => {
    it('debería llamar a remove en el servicio', async () => {
      eventsService.remove.mockResolvedValueOnce(undefined);

      await controller.remove('uuid-123', mockAuthenticatedRequest as never);

      expect(eventsService.remove).toHaveBeenCalledWith('uuid-123', {
        companyId: 2,
        isSuperAdmin: false,
      });
    });
  });

  describe('findAll', () => {
    it('debería lanzar BadRequestException si no se provee companyUuid', async () => {
      const paginationDto: EventsPaginationDto = { page: 1, limit: 10 };
      await expect(controller.findAll(paginationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería retornar listado público mapeado a EventResponseDto', async () => {
      const paginationDto: EventsPaginationDto = {
        page: 1,
        limit: 10,
        companyUuid: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };
      const serviceResponse = {
        data: [mockEvent as Event],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      eventsService.findAll.mockResolvedValueOnce(serviceResponse);

      const result = await controller.findAll(paginationDto);

      expect(result.data[0].id).toBe(mockEvent.id);
      expect(eventsService.findAll).toHaveBeenCalledWith({
        ...paginationDto,
        companyId: 2,
      });
    });
  });

  describe('findOneBySlug', () => {
    it('debería retornar un evento por slug mapeado a EventResponseDto', async () => {
      eventsService.findOneBySlug.mockResolvedValueOnce(mockEvent as Event);

      const result = await controller.findOneBySlug('evento-de-prueba');

      expect(result.id).toBe(mockEvent.id);
      expect(eventsService.findOneBySlug).toHaveBeenCalledWith(
        'evento-de-prueba',
      );
    });
  });
});
