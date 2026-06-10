import { Test, TestingModule } from '@nestjs/testing';
import { ActivationTokensService } from './activation-tokens.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivationToken } from './entities/activation-token.entity';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('ActivationTokensService', () => {
  let service: ActivationTokensService;
  let mockRepository: DeepMocked<Repository<ActivationToken>>;

  beforeEach(async () => {
    mockRepository = createMock<Repository<ActivationToken>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivationTokensService,
        {
          provide: getRepositoryToken(ActivationToken),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivationTokensService>(ActivationTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('should generate and save a token with a 24h expiration', async () => {
      const userId = faker.number.int();
      const mockToken = new ActivationToken();

      mockRepository.create.mockReturnValue(mockToken);
      mockRepository.save.mockResolvedValue(mockToken);

      const rawToken = await service.createToken(userId);

      expect(typeof rawToken).toBe('string');
      expect(mockRepository.delete).toHaveBeenCalledWith({
        user: { id: userId },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: rawToken,
          user: { id: userId },
        }),
      );

      const createCallArgs = mockRepository.create.mock
        .calls[0][0] as Partial<ActivationToken>;
      const expiresAt = createCallArgs.expiresAt!;
      const expectedTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      expect(Math.abs(expiresAt.getTime() - expectedTime)).toBeLessThan(5000); // within 5 seconds

      expect(mockRepository.save).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('findActiveToken', () => {
    it('should return the token when it exists and isUsed is false', async () => {
      const hashedToken = 'some-hash';
      const token = new ActivationToken();
      mockRepository.findOne.mockResolvedValue(token);

      const result = await service.findActiveToken(hashedToken);

      expect(result).toEqual(token);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tokenHash: hashedToken, isUsed: false },
        relations: ['user'],
      });
    });

    it('should return null when the token is used or does not exist', async () => {
      const hashedToken = 'invalid-hash';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findActiveToken(hashedToken);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tokenHash: hashedToken, isUsed: false },
        relations: ['user'],
      });
    });
  });

  describe('markAsUsed', () => {
    it('should call repo.update with isUsed: true', async () => {
      const tokenId = faker.number.int();
      mockRepository.update.mockResolvedValue({
        raw: [],
        generatedMaps: [],
        affected: 1,
      });

      await service.markAsUsed(tokenId);

      expect(mockRepository.update).toHaveBeenCalledWith(tokenId, {
        isUsed: true,
      });
    });
  });
});
