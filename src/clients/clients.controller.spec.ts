import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: jest.Mocked<Partial<ClientsService>>;

  beforeEach(async () => {
    const mockClientsService = {
      getClients: jest.fn(),
      getClientById: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
      getRepresentatives: jest.fn(),
      createRepresentative: jest.fn(),
      updateRepresentative: jest.fn(),
      deleteRepresentative: jest.fn(),
      getEstablishments: jest.fn(),
      getEstablishmentById: jest.fn(),
      createEstablishment: jest.fn(),
      updateEstablishment: jest.fn(),
      deleteEstablishment: jest.fn(),
      getContracts: jest.fn(),
      createContract: jest.fn(),
      getContractById: jest.fn(),
      updateContract: jest.fn(),
      deleteContract: jest.fn(),
      getEstablishmentStaff: jest.fn(),
      assignStaffToEstablishment: jest.fn(),
      unassignStaffFromEstablishment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ModuleAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get(ClientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get clients', async () => {
    const mockResult = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
    (service.getClients as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await controller.getClients(1, {});
    expect(result).toEqual(mockResult);
    expect(service.getClients).toHaveBeenCalledWith(1, {});
  });

  it('should get client by id', async () => {
    (service.getClientById as jest.Mock).mockResolvedValueOnce({
      id: 'uuid-1',
    });
    const result = await controller.getClientById(1, 'uuid-1');
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.getClientById).toHaveBeenCalledWith(1, 'uuid-1');
  });

  it('should create client', async () => {
    const dto = { ruc: '123' } as any;
    (service.createClient as jest.Mock).mockResolvedValueOnce({ id: 'uuid-1' });
    const result = await controller.createClient(1, dto);
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.createClient).toHaveBeenCalledWith(1, dto);
  });

  it('should update client', async () => {
    const dto = { businessName: 'New' } as any;
    (service.updateClient as jest.Mock).mockResolvedValueOnce({ id: 'uuid-1' });
    const result = await controller.updateClient(1, 'uuid-1', dto);
    expect(result).toEqual({ id: 'uuid-1' });
    expect(service.updateClient).toHaveBeenCalledWith(1, 'uuid-1', dto);
  });

  it('should delete client', async () => {
    (service.deleteClient as jest.Mock).mockResolvedValueOnce(undefined);
    await controller.deleteClient(1, 'uuid-1');
    expect(service.deleteClient).toHaveBeenCalledWith(1, 'uuid-1');
  });

  it('should get representatives', async () => {
    (service.getRepresentatives as jest.Mock).mockResolvedValueOnce([]);
    const result = await controller.getRepresentatives(1, 'client-1');
    expect(result).toEqual([]);
    expect(service.getRepresentatives).toHaveBeenCalledWith(1, 'client-1');
  });

  it('should create representative', async () => {
    const dto = {} as any;
    (service.createRepresentative as jest.Mock).mockResolvedValueOnce({
      id: 'rep-1',
    });
    const result = await controller.createRepresentative(1, 'client-1', dto);
    expect(result).toEqual({ id: 'rep-1' });
    expect(service.createRepresentative).toHaveBeenCalledWith(
      1,
      'client-1',
      dto,
    );
  });

  it('should update representative', async () => {
    const dto = {} as any;
    (service.updateRepresentative as jest.Mock).mockResolvedValueOnce({
      id: 'rep-1',
    });
    const result = await controller.updateRepresentative(
      1,
      'client-1',
      'rep-1',
      dto,
    );
    expect(result).toEqual({ id: 'rep-1' });
    expect(service.updateRepresentative).toHaveBeenCalledWith(
      1,
      'client-1',
      'rep-1',
      dto,
    );
  });

  it('should delete representative', async () => {
    (service.deleteRepresentative as jest.Mock).mockResolvedValueOnce(
      undefined,
    );
    await controller.deleteRepresentative(1, 'client-1', 'rep-1');
    expect(service.deleteRepresentative).toHaveBeenCalledWith(
      1,
      'client-1',
      'rep-1',
    );
  });

  it('should get establishments', async () => {
    (service.getEstablishments as jest.Mock).mockResolvedValueOnce([]);
    const result = await controller.getEstablishments(1, 'client-1');
    expect(result).toEqual([]);
    expect(service.getEstablishments).toHaveBeenCalledWith(1, 'client-1');
  });

  it('should get establishment by id', async () => {
    (service.getEstablishmentById as jest.Mock).mockResolvedValueOnce({
      id: 'est-1',
    });
    const result = await controller.getEstablishmentById(
      1,
      'client-1',
      'est-1',
    );
    expect(result).toEqual({ id: 'est-1' });
    expect(service.getEstablishmentById).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
    );
  });

  it('should create establishment', async () => {
    const dto = {} as any;
    (service.createEstablishment as jest.Mock).mockResolvedValueOnce({
      id: 'est-1',
    });
    const result = await controller.createEstablishment(1, 'client-1', dto);
    expect(result).toEqual({ id: 'est-1' });
    expect(service.createEstablishment).toHaveBeenCalledWith(
      1,
      'client-1',
      dto,
    );
  });

  it('should update establishment', async () => {
    const dto = {} as any;
    (service.updateEstablishment as jest.Mock).mockResolvedValueOnce({
      id: 'est-1',
    });
    const result = await controller.updateEstablishment(
      1,
      'client-1',
      'est-1',
      dto,
    );
    expect(result).toEqual({ id: 'est-1' });
    expect(service.updateEstablishment).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      dto,
    );
  });

  it('should delete establishment', async () => {
    (service.deleteEstablishment as jest.Mock).mockResolvedValueOnce(undefined);
    await controller.deleteEstablishment(1, 'client-1', 'est-1');
    expect(service.deleteEstablishment).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
    );
  });

  it('should get contracts', async () => {
    (service.getContracts as jest.Mock).mockResolvedValueOnce([]);
    const result = await controller.getContracts(1, 'client-1', 'est-1');
    expect(result).toEqual([]);
    expect(service.getContracts).toHaveBeenCalledWith(1, 'client-1', 'est-1');
  });

  it('should create contract', async () => {
    const dto = {} as any;
    (service.createContract as jest.Mock).mockResolvedValueOnce({
      id: 'con-1',
    });
    const result = await controller.createContract(1, 'client-1', 'est-1', dto);
    expect(result).toEqual({ id: 'con-1' });
    expect(service.createContract).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      dto,
    );
  });

  it('should get contract by id', async () => {
    (service.getContractById as jest.Mock).mockResolvedValueOnce({
      id: 'con-1',
    });
    const result = await controller.getContractById(
      1,
      'client-1',
      'est-1',
      'con-1',
    );
    expect(result).toEqual({ id: 'con-1' });
    expect(service.getContractById).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      'con-1',
    );
  });

  it('should update contract', async () => {
    const dto = {} as any;
    (service.updateContract as jest.Mock).mockResolvedValueOnce({
      id: 'con-1',
    });
    const result = await controller.updateContract(
      1,
      'client-1',
      'est-1',
      'con-1',
      dto,
    );
    expect(result).toEqual({ id: 'con-1' });
    expect(service.updateContract).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      'con-1',
      dto,
    );
  });

  it('should delete contract', async () => {
    (service.deleteContract as jest.Mock).mockResolvedValueOnce(undefined);
    await controller.deleteContract(1, 'client-1', 'est-1', 'con-1');
    expect(service.deleteContract).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      'con-1',
    );
  });

  it('should get establishment staff', async () => {
    (service.getEstablishmentStaff as jest.Mock).mockResolvedValueOnce([]);
    const result = await controller.getEstablishmentStaff(
      1,
      'client-1',
      'est-1',
    );
    expect(result).toEqual([]);
    expect(service.getEstablishmentStaff).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
    );
  });

  it('should assign staff to establishment', async () => {
    const dto = { staffMemberId: 10, startDate: '2025-01-01' };
    (service.assignStaffToEstablishment as jest.Mock).mockResolvedValueOnce({
      id: 'asgn-1',
    });
    const result = await controller.assignStaffToEstablishment(
      1,
      'client-1',
      'est-1',
      dto,
    );
    expect(result).toEqual({ id: 'asgn-1' });
    expect(service.assignStaffToEstablishment).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      dto,
    );
  });

  it('should unassign staff from establishment', async () => {
    (service.unassignStaffFromEstablishment as jest.Mock).mockResolvedValueOnce(
      undefined,
    );
    await controller.unassignStaffFromEstablishment(1, 'client-1', 'est-1', 10);
    expect(service.unassignStaffFromEstablishment).toHaveBeenCalledWith(
      1,
      'client-1',
      'est-1',
      10,
    );
  });
});
