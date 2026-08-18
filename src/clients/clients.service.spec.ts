import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CLIENTS_REPOSITORY } from './interfaces/i-clients-repository.interface';
import {
  ClientType,
  TaxCondition,
  RepresentativeRole,
  DocumentType,
  ContractType,
} from './constants/clients-enums';
import {
  ClientDuplicateRucException,
  ClientNotFoundException,
  EstablishmentNotFoundException,
  ContractNotFoundException,
  RepresentativeNotFoundException,
} from './exceptions';
import { StaffService } from '../staff/staff.service';

const mockClientsRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  findByRuc: jest.fn(),
  findClientWithRelations: jest.fn(),
  createClient: jest.fn(),
  updateClient: jest.fn(),
  deleteClient: jest.fn(),
  findRepresentativesByClientId: jest.fn(),
  createRepresentative: jest.fn(),
  updateRepresentative: jest.fn(),
  deleteRepresentative: jest.fn(),
  findEstablishmentsByClientId: jest.fn(),
  findEstablishmentById: jest.fn(),
  findEstablishmentWithStaff: jest.fn(),
  createEstablishment: jest.fn(),
  updateEstablishment: jest.fn(),
  deleteEstablishment: jest.fn(),
  findContractsByEstablishmentId: jest.fn(),
  findContractById: jest.fn(),
  createContract: jest.fn(),
  updateContract: jest.fn(),
  deleteContract: jest.fn(),
  findStaffByEstablishmentId: jest.fn(),
  assignStaffToEstablishment: jest.fn(),
  unassignStaffFromEstablishment: jest.fn(),
};

const mockStaffService = {
  findById: jest.fn(),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: CLIENTS_REPOSITORY,
          useValue: mockClientsRepository,
        },
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClients', () => {
    it('should return paginated clients with default query options', async () => {
      mockClientsRepository.findByCompanyId.mockResolvedValueOnce([
        [{ id: '1' }],
        1,
      ]);

      const result = await service.getClients(1, {});
      expect(result).toEqual({
        data: [{ id: '1' }],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
      expect(mockClientsRepository.findByCompanyId).toHaveBeenCalledWith(
        1,
        1,
        20,
        {},
      );
    });

    it('should return paginated clients with custom page and limit', async () => {
      mockClientsRepository.findByCompanyId.mockResolvedValueOnce([
        [{ id: '1' }],
        50,
      ]);

      const result = await service.getClients(1, { page: 2, limit: 10 });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.hasPrevPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getClientById', () => {
    it('should throw an error if client not found', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce(null);
      await expect(service.getClientById(1, 'non-existing')).rejects.toThrow(
        ClientNotFoundException,
      );
    });

    it('should return client if found', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'exist',
      });
      const res = await service.getClientById(1, 'exist');
      expect(res).toEqual({ id: 'exist' });
    });
  });

  describe('createClient', () => {
    it('should throw an error if RUC is duplicate', async () => {
      mockClientsRepository.findByRuc.mockResolvedValueOnce({ id: '1' });

      await expect(
        service.createClient(1, {
          ruc: '123456-7',
          clientType: ClientType.PERSONA_JURIDICA,
          businessName: 'Test SA',
          taxCondition: TaxCondition.IVA_10,
        }),
      ).rejects.toThrow(ClientDuplicateRucException);
    });

    it('should throw BadRequestException if PERSONA_FISICA is missing firstName or lastName', async () => {
      mockClientsRepository.findByRuc.mockResolvedValueOnce(null);

      await expect(
        service.createClient(1, {
          ruc: '123456-7',
          clientType: ClientType.PERSONA_FISICA,
          businessName: 'Test Individual',
          taxCondition: TaxCondition.IVA_10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a PERSONA_FISICA client with birthDate successfully', async () => {
      mockClientsRepository.findByRuc.mockResolvedValueOnce(null);
      mockClientsRepository.createClient.mockResolvedValueOnce({ id: '123' });

      const result = await service.createClient(1, {
        ruc: '123456-7',
        clientType: ClientType.PERSONA_FISICA,
        businessName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        taxCondition: TaxCondition.IVA_10,
        birthDate: '1990-01-01',
      });

      expect(result).toEqual({ id: '123' });
      expect(mockClientsRepository.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 1,
          firstName: 'John',
          lastName: 'Doe',
          birthDate: expect.any(Date),
        }),
      );
    });

    it('should create a PERSONA_JURIDICA client successfully', async () => {
      mockClientsRepository.findByRuc.mockResolvedValueOnce(null);
      mockClientsRepository.createClient.mockResolvedValueOnce({ id: '123' });

      const result = await service.createClient(1, {
        ruc: '123456-7',
        clientType: ClientType.PERSONA_JURIDICA,
        businessName: 'Test SA',
        taxCondition: TaxCondition.IVA_10,
      });

      expect(result).toEqual({ id: '123' });
    });
  });

  describe('updateClient', () => {
    it('should throw ClientNotFoundException if client does not exist', async () => {
      mockClientsRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.updateClient(1, 'not-exist', { businessName: 'New Name' }),
      ).rejects.toThrow(ClientNotFoundException);
    });

    it('should throw ClientDuplicateRucException if new RUC is already taken', async () => {
      mockClientsRepository.findById.mockResolvedValueOnce({
        id: '1',
        ruc: 'old-ruc',
      });
      mockClientsRepository.findByRuc.mockResolvedValueOnce({
        id: '2',
        ruc: 'new-ruc',
      });

      await expect(
        service.updateClient(1, '1', { ruc: 'new-ruc' }),
      ).rejects.toThrow(ClientDuplicateRucException);
    });

    it('should update client with unchanged or valid new RUC and birthDate', async () => {
      mockClientsRepository.findById.mockResolvedValueOnce({
        id: '1',
        ruc: 'same-ruc',
      });
      mockClientsRepository.updateClient.mockResolvedValueOnce({
        id: '1',
        businessName: 'Updated',
      });

      const result = await service.updateClient(1, '1', {
        ruc: 'same-ruc',
        businessName: 'Updated',
        birthDate: '1995-05-05',
      });

      expect(result).toEqual({ id: '1', businessName: 'Updated' });
      expect(mockClientsRepository.findByRuc).not.toHaveBeenCalled();
      expect(mockClientsRepository.updateClient).toHaveBeenCalledWith(
        '1',
        1,
        expect.objectContaining({
          businessName: 'Updated',
          birthDate: expect.any(Date),
        }),
      );
    });
  });

  describe('deleteClient', () => {
    it('should throw ClientNotFoundException if client not found', async () => {
      mockClientsRepository.findById.mockResolvedValueOnce(null);

      await expect(service.deleteClient(1, 'not-exist')).rejects.toThrow(
        ClientNotFoundException,
      );
    });

    it('should delete client successfully', async () => {
      mockClientsRepository.findById.mockResolvedValueOnce({ id: 'exist' });
      mockClientsRepository.deleteClient.mockResolvedValueOnce(undefined);

      await expect(service.deleteClient(1, 'exist')).resolves.toBeUndefined();
      expect(mockClientsRepository.deleteClient).toHaveBeenCalledWith(
        'exist',
        1,
      );
    });
  });

  describe('Representatives', () => {
    it('should get representatives for a client', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findRepresentativesByClientId.mockResolvedValueOnce(
        [{ id: 'r1' }],
      );

      const result = await service.getRepresentatives(1, 'c1');
      expect(result).toEqual([{ id: 'r1' }]);
    });

    it('should create representative with start and end dates', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.createRepresentative.mockResolvedValueOnce({
        id: 'r1',
      });

      const result = await service.createRepresentative(1, 'c1', {
        firstName: 'Jane',
        lastName: 'Doe',
        documentType: DocumentType.CEDULA_PY,
        documentNumber: '12345',
        role: RepresentativeRole.GERENTE,
        roleStartDate: '2023-01-01',
        roleEndDate: '2024-01-01',
      });

      expect(result).toEqual({ id: 'r1' });
      expect(mockClientsRepository.createRepresentative).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'c1',
          roleStartDate: expect.any(Date),
          roleEndDate: expect.any(Date),
        }),
      );
    });

    it('should create representative without dates', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.createRepresentative.mockResolvedValueOnce({
        id: 'r1',
      });

      const result = await service.createRepresentative(1, 'c1', {
        firstName: 'Jane',
        lastName: 'Doe',
        documentType: DocumentType.CEDULA_PY,
        documentNumber: '12345',
        role: RepresentativeRole.PROPIETARIO,
      });

      expect(result).toEqual({ id: 'r1' });
    });

    it('should update representative successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.updateRepresentative.mockResolvedValueOnce({
        id: 'r1',
        role: RepresentativeRole.GERENTE,
      });

      const result = await service.updateRepresentative(1, 'c1', 'r1', {
        role: RepresentativeRole.GERENTE,
        roleStartDate: '2023-01-01',
      });

      expect(result).toEqual({ id: 'r1', role: RepresentativeRole.GERENTE });
    });

    it('should throw RepresentativeNotFoundException if updateRepresentative returns null', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.updateRepresentative.mockResolvedValueOnce(null);

      await expect(
        service.updateRepresentative(1, 'c1', 'not-exist', {
          role: RepresentativeRole.APODERADO,
        }),
      ).rejects.toThrow(RepresentativeNotFoundException);
    });

    it('should delete representative successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.deleteRepresentative.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        service.deleteRepresentative(1, 'c1', 'r1'),
      ).resolves.toBeUndefined();
      expect(mockClientsRepository.deleteRepresentative).toHaveBeenCalledWith(
        'r1',
        'c1',
      );
    });
  });

  describe('Establishments', () => {
    it('should get establishments for client', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentsByClientId.mockResolvedValueOnce([
        { id: 'e1' },
      ]);

      const result = await service.getEstablishments(1, 'c1');
      expect(result).toEqual([{ id: 'e1' }]);
    });

    it('should get establishment by id', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });

      const result = await service.getEstablishmentById(1, 'c1', 'e1');
      expect(result).toEqual({ id: 'e1' });
    });

    it('should throw EstablishmentNotFoundException if establishment not found', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce(
        null,
      );

      await expect(service.getEstablishmentById(1, 'c1', 'e1')).rejects.toThrow(
        EstablishmentNotFoundException,
      );
    });

    it('should create establishment successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.createEstablishment.mockResolvedValueOnce({
        id: 'e1',
      });

      const result = await service.createEstablishment(1, 'c1', {
        name: 'Headquarters',
        address: 'Main St 123',
      });

      expect(result).toEqual({ id: 'e1' });
    });

    it('should update establishment successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.updateEstablishment.mockResolvedValueOnce({
        id: 'e1',
        name: 'HQ Updated',
      });

      const result = await service.updateEstablishment(1, 'c1', 'e1', {
        name: 'HQ Updated',
      });
      expect(result).toEqual({ id: 'e1', name: 'HQ Updated' });
    });

    it('should throw EstablishmentNotFoundException when updating non-existent establishment', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.updateEstablishment.mockResolvedValueOnce(null);

      await expect(
        service.updateEstablishment(1, 'c1', 'e1', { name: 'HQ Updated' }),
      ).rejects.toThrow(EstablishmentNotFoundException);
    });

    it('should delete establishment successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentById.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.deleteEstablishment.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        service.deleteEstablishment(1, 'c1', 'e1'),
      ).resolves.toBeUndefined();
      expect(mockClientsRepository.deleteEstablishment).toHaveBeenCalledWith(
        'e1',
        'c1',
      );
    });

    it('should throw EstablishmentNotFoundException when deleting non-existent establishment', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentById.mockResolvedValueOnce(null);

      await expect(service.deleteEstablishment(1, 'c1', 'e1')).rejects.toThrow(
        EstablishmentNotFoundException,
      );
    });
  });

  describe('Contracts', () => {
    it('should get contracts for establishment', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      const findContracts =
        mockClientsRepository.findContractsByEstablishmentId;
      findContracts.mockResolvedValueOnce([{ id: 'cnt1' }]);

      const result = await service.getContracts(1, 'c1', 'e1');
      expect(result).toEqual([{ id: 'cnt1' }]);
    });

    it('should get contract by id', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.findContractById.mockResolvedValueOnce({
        id: 'cnt1',
      });

      const result = await service.getContractById(1, 'c1', 'e1', 'cnt1');
      expect(result).toEqual({ id: 'cnt1' });
    });

    it('should throw ContractNotFoundException if contract not found by id', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.findContractById.mockResolvedValueOnce(null);

      await expect(
        service.getContractById(1, 'c1', 'e1', 'cnt1'),
      ).rejects.toThrow(ContractNotFoundException);
    });

    it('should throw BadRequestException if monthlyAmount is missing when creating contract', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });

      await expect(
        service.createContract(1, 'c1', 'e1', {
          contractType: ContractType.ABONO_FIJO,
          startDate: '2024-01-01',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create contract successfully with dates', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.createContract.mockResolvedValueOnce({
        id: 'cnt1',
      });

      const result = await service.createContract(1, 'c1', 'e1', {
        contractType: ContractType.ABONO_FIJO,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        monthlyAmount: 5000000,
      });

      expect(result).toEqual({ id: 'cnt1' });
      expect(mockClientsRepository.createContract).toHaveBeenCalledWith(
        expect.objectContaining({
          establishmentId: 'e1',
          monthlyAmount: 5000000,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );
    });

    it('should update contract successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.updateContract.mockResolvedValueOnce({
        id: 'cnt1',
        monthlyAmount: 6000000,
      });

      const result = await service.updateContract(1, 'c1', 'e1', 'cnt1', {
        monthlyAmount: 6000000,
        startDate: '2024-02-01',
        endDate: '2025-02-01',
      });

      expect(result).toEqual({ id: 'cnt1', monthlyAmount: 6000000 });
    });

    it('should throw ContractNotFoundException if updating non-existent contract', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.updateContract.mockResolvedValueOnce(null);

      await expect(
        service.updateContract(1, 'c1', 'e1', 'cnt1', {
          monthlyAmount: 6000000,
        }),
      ).rejects.toThrow(ContractNotFoundException);
    });

    it('should delete contract successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.findContractById.mockResolvedValueOnce({
        id: 'cnt1',
      });
      mockClientsRepository.deleteContract.mockResolvedValueOnce(undefined);

      await expect(
        service.deleteContract(1, 'c1', 'e1', 'cnt1'),
      ).resolves.toBeUndefined();
      expect(mockClientsRepository.deleteContract).toHaveBeenCalledWith(
        'cnt1',
        'e1',
      );
    });

    it('should throw ContractNotFoundException when deleting non-existent contract', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.findContractById.mockResolvedValueOnce(null);

      await expect(
        service.deleteContract(1, 'c1', 'e1', 'cnt1'),
      ).rejects.toThrow(ContractNotFoundException);
    });
  });

  describe('Staff Assignments', () => {
    it('should get establishment staff', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockClientsRepository.findStaffByEstablishmentId.mockResolvedValueOnce([
        { staffMemberId: 1 },
      ]);

      const result = await service.getEstablishmentStaff(1, 'c1', 'e1');
      expect(result).toEqual([{ staffMemberId: 1 }]);
    });

    it('should throw BadRequestException if staffMemberId is NaN when assigning', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });

      await expect(
        service.assignStaffToEstablishment(1, 'c1', 'e1', {
          staffMemberId: 'invalid' as any,
          startDate: '2024-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should assign staff to establishment successfully with active status', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockStaffService.findById.mockResolvedValueOnce({ id: 1 });
      mockClientsRepository.assignStaffToEstablishment.mockResolvedValueOnce({
        id: 'assign-1',
        endDate: null,
      });

      const result = await service.assignStaffToEstablishment(1, 'c1', 'e1', {
        staffMemberId: 1,
        startDate: '2024-01-01',
      });

      expect(result).toEqual({
        id: 'assign-1',
        endDate: null,
        staffMemberId: 1,
        isActive: true,
      });
    });

    it('should throw NotFoundException on postgres 23503 foreign key violation', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      mockStaffService.findById.mockResolvedValueOnce({ id: 99 });
      mockClientsRepository.assignStaffToEstablishment.mockRejectedValueOnce({
        code: '23503',
      });

      await expect(
        service.assignStaffToEstablishment(1, 'c1', 'e1', {
          staffMemberId: 99,
          startDate: '2024-01-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should unassign staff from establishment successfully', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });
      const mockUnassign = mockClientsRepository.unassignStaffFromEstablishment;
      mockUnassign.mockResolvedValueOnce(undefined);

      await expect(
        service.unassignStaffFromEstablishment(1, 'c1', 'e1', 1),
      ).resolves.toBeUndefined();
      expect(
        mockClientsRepository.unassignStaffFromEstablishment,
      ).toHaveBeenCalledWith(1, 'e1');
    });

    it('should throw BadRequestException if staffMemberId is NaN when unassigning', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({
        id: 'c1',
      });
      mockClientsRepository.findEstablishmentWithStaff.mockResolvedValueOnce({
        id: 'e1',
      });

      await expect(
        service.unassignStaffFromEstablishment(1, 'c1', 'e1', 'invalid' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
