import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { EventsService } from './events.service';
import {
  IEventRepository,
  EVENT_REPOSITORY,
} from './interfaces/i-event-repository.interface';
import { Event, EventOrganizer, EventStatus } from './entities/event.entity';
import { CreateEventDto, EventsPaginationDto } from './dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { EventNotFoundException } from './exceptions/event-not-found.exception';

describe('EventsService', () => {
  let service: EventsService;
  let mockEventRepository: DeepMocked<IEventRepository>;

  const mockUser: JwtPayload = {
    sub: 123,
    uuid: 'user-uuid-123',
    email: 'test@example.com',
    companyId: 2,
    isSuperAdmin: false,
    role: 'user',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockEventRepository = createMock<IEventRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EVENT_REPOSITORY, useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un evento en borrador sin campos en inglés', async () => {
      const dto: CreateEventDto = {
        tituloEs: 'Evento Es',
        resumenEs: 'Resumen Es',
        contenidoEs: 'Contenido Es',
        imagenPortada: 'https://cloudinary.com/demo.jpg',
        fechaEvento: '2025-10-15T19:00:00-04:00',
        organizador: EventOrganizer.CCPS,
        estado: EventStatus.BORRADOR,
      };

      const savedMock = {
        id: 'uuid-1',
        tituloEs: 'Evento Es',
        estado: EventStatus.BORRADOR,
      } as Event;

      mockEventRepository.createEvent.mockResolvedValue(savedMock);

      const result = await service.create(dto, '123', 1);

      expect(result).toEqual(savedMock);
      expect(mockEventRepository.createEvent).toHaveBeenCalledWith(
        dto,
        '123',
        1,
      );
    });

    it('debería lanzar BadRequestException al publicar sin campos en inglés', async () => {
      const dto: CreateEventDto = {
        tituloEs: 'Evento Es',
        resumenEs: 'Resumen Es',
        contenidoEs: 'Contenido Es',
        imagenPortada: 'https://cloudinary.com/demo.jpg',
        fechaEvento: '2025-10-15T19:00:00-04:00',
        organizador: EventOrganizer.CCPS,
        estado: EventStatus.PUBLICADO,
      };

      await expect(service.create(dto, '123', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si organizador es SOCIO y no tiene organizadorNombre', async () => {
      const dto: CreateEventDto = {
        tituloEs: 'Evento Es',
        resumenEs: 'Resumen Es',
        contenidoEs: 'Contenido Es',
        imagenPortada: 'https://cloudinary.com/demo.jpg',
        fechaEvento: '2025-10-15T19:00:00-04:00',
        organizador: EventOrganizer.SOCIO,
        estado: EventStatus.BORRADOR,
      };

      await expect(service.create(dto, '123', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar InternalServerErrorException si ocurre un error genérico en la BD', async () => {
      const dto: CreateEventDto = {
        tituloEs: 'Evento Es',
        resumenEs: 'Resumen Es',
        contenidoEs: 'Contenido Es',
        imagenPortada: 'https://cloudinary.com/demo.jpg',
        fechaEvento: '2025-10-15T19:00:00-04:00',
        organizador: EventOrganizer.CCPS,
        estado: EventStatus.BORRADOR,
      };

      mockEventRepository.createEvent.mockRejectedValue(
        new Error('DB connection failed'),
      );

      await expect(service.create(dto, '123', 1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllAdmin', () => {
    it('debería retornar listado paginado para administrador', async () => {
      const dto: EventsPaginationDto = { page: 1, limit: 10 };
      const data = [{ id: '1', tituloEs: 'E1' } as Event];
      mockEventRepository.findPaginated.mockResolvedValue([data, 1]);

      const result = await service.findAllAdmin(dto, 1);

      expect(result.data).toEqual(data);
      expect(result.meta.total).toBe(1);
    });

    it('debería lanzar InternalServerErrorException en fallo', async () => {
      mockEventRepository.findPaginated.mockRejectedValue(new Error('Failed'));
      await expect(service.findAllAdmin({}, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('debería lanzar EventNotFoundException si no existe el evento', async () => {
      mockEventRepository.findOneById.mockResolvedValue(null);
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        EventNotFoundException,
      );
    });

    it('debería lanzar ForbiddenException si el tenant no coincide y no es superadmin', async () => {
      const eventMock = { id: 'uuid-1', companyId: 2 } as Event;
      mockEventRepository.findOneById.mockResolvedValue(eventMock);

      const user: JwtPayload = {
        ...mockUser,
        companyId: 3,
      };

      await expect(service.update('uuid-1', {}, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debería permitir actualizar si es superadmin aunque no coincida el tenant', async () => {
      const eventMock = {
        id: 'uuid-1',
        companyId: 2,
        estado: EventStatus.BORRADOR,
        organizador: EventOrganizer.CCPS,
      } as Event;
      mockEventRepository.findOneById.mockResolvedValue(eventMock);
      mockEventRepository.updateEvent.mockResolvedValue({
        ...eventMock,
        tituloEs: 'Updated',
      } as Event);

      const user: JwtPayload = {
        ...mockUser,
        companyId: 3,
        isSuperAdmin: true,
      };

      const result = await service.update(
        'uuid-1',
        { tituloEs: 'Updated' },
        user,
      );
      expect(result.tituloEs).toBe('Updated');
    });

    it('debería lanzar BadRequestException si se intenta publicar sin campos en inglés', async () => {
      const eventMock = {
        id: 'uuid-1',
        companyId: 2,
        estado: EventStatus.BORRADOR,
        organizador: EventOrganizer.CCPS,
      } as Event;
      mockEventRepository.findOneById.mockResolvedValue(eventMock);

      const user: JwtPayload = {
        ...mockUser,
        companyId: 2,
      };

      await expect(
        service.update('uuid-1', { estado: EventStatus.PUBLICADO }, user),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debería llamar softDelete correctamente', async () => {
      const eventMock = { id: 'uuid-1', companyId: 2 } as Event;
      mockEventRepository.findOneById.mockResolvedValue(eventMock);
      mockEventRepository.softDelete.mockResolvedValue(undefined);

      await service.remove('uuid-1', mockUser);

      expect(mockEventRepository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('debería lanzar InternalServerErrorException si falla el repositorio', async () => {
      mockEventRepository.findOneById.mockResolvedValue({
        id: 'uuid-1',
        companyId: 2,
      } as Event);
      mockEventRepository.softDelete.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.remove('uuid-1', mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar listado público paginado', async () => {
      const dto: EventsPaginationDto = { page: 1, limit: 10, companyId: 1 };
      const data = [{ id: '1', estado: EventStatus.PUBLICADO } as Event];
      mockEventRepository.findPaginated.mockResolvedValue([data, 1]);

      const result = await service.findAll(dto);

      expect(result.data).toEqual(data);
      expect(mockEventRepository.findPaginated).toHaveBeenCalledWith(
        dto,
        1,
        EventStatus.PUBLICADO,
      );
    });
  });

  describe('findOneBySlug', () => {
    it('debería retornar evento por slug', async () => {
      const eventMock = { id: '1', slugEs: 'mi-slug' } as Event;
      mockEventRepository.findOneBySlug.mockResolvedValue(eventMock);

      const result = await service.findOneBySlug('mi-slug');
      expect(result).toEqual(eventMock);
    });

    it('debería lanzar EventNotFoundException si no existe', async () => {
      mockEventRepository.findOneBySlug.mockResolvedValue(null);
      await expect(service.findOneBySlug('inexistente')).rejects.toThrow(
        EventNotFoundException,
      );
    });
  });
});
