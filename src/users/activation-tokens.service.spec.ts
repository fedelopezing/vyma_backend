import { Test, TestingModule } from '@nestjs/testing';
import { ActivationTokensService } from './activation-tokens.service';
import { ActivationToken } from './entities/activation-token.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { ActivationTokensRepository } from './repositories/activation-tokens.repository';

describe('ActivationTokensService', () => {
  let service: ActivationTokensService;
  let repository: DeepMocked<ActivationTokensRepository>;

  beforeEach(async () => {
    repository = createMock<ActivationTokensRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivationTokensService,
        {
          provide: ActivationTokensRepository,
          useValue: repository,
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

      repository.create.mockReturnValue(mockToken);
      repository.save.mockResolvedValue(mockToken);

      const rawToken = await service.createToken(userId);

      expect(typeof rawToken).toBe('string');
      expect(repository.deleteByUserId).toHaveBeenCalledWith(userId, undefined);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: rawToken,
        }),
        undefined,
      );

      const createCallArgs = repository.create.mock
        .calls[0][0] as Partial<ActivationToken>;
      const expiresAt = createCallArgs.expiresAt!;
      const expectedTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      expect(Math.abs(expiresAt.getTime() - expectedTime)).toBeLessThan(5000); // within 5 seconds

      expect(repository.save).toHaveBeenCalledWith(mockToken, undefined);
    });
  });

  describe('findActiveToken', () => {
    it('should return the token when it exists and isUsed is false', async () => {
      const hashedToken = 'some-hash';
      const token = new ActivationToken();
      repository.findActiveToken.mockResolvedValue(token);

      const result = await service.findActiveToken(hashedToken);

      expect(result).toEqual(token);
      expect(repository.findActiveToken).toHaveBeenCalledWith(hashedToken);
    });

    it('should return null when the token is used or does not exist', async () => {
      const hashedToken = 'invalid-hash';
      repository.findActiveToken.mockResolvedValue(null);

      const result = await service.findActiveToken(hashedToken);

      expect(result).toBeNull();
      expect(repository.findActiveToken).toHaveBeenCalledWith(hashedToken);
    });
  });

  describe('markAsUsed', () => {
    it('should call repo.update with isUsed: true', async () => {
      const tokenId = faker.number.int();
      repository.update.mockResolvedValue(undefined);

      await service.markAsUsed(tokenId);

      expect(repository.update).toHaveBeenCalledWith(
        tokenId,
        { isUsed: true },
        undefined,
      );
    });
  });
});
