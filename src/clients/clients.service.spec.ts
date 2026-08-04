import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { CLIENTS_REPOSITORY } from './interfaces/i-clients-repository.interface';
import { ClientType, TaxCondition } from './constants/clients-enums';
import { ClientDuplicateRucException, ClientNotFoundException } from './exceptions';

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
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    it('should create a client successfully', async () => {
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

  describe('getClientById', () => {
    it('should throw an error if client not found', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce(null);
      await expect(service.getClientById(1, 'non-existing')).rejects.toThrow(ClientNotFoundException);
    });

    it('should return client if found', async () => {
      mockClientsRepository.findClientWithRelations.mockResolvedValueOnce({ id: 'exist' });
      const res = await service.getClientById(1, 'exist');
      expect(res).toEqual({ id: 'exist' });
    });
  });

  // More tests could be added for 80% coverage on service
});
