import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenCleanupCron } from './token-cleanup.cron';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ActivationToken } from '../../users/entities/activation-token.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Repository, DeleteResult } from 'typeorm';

describe('TokenCleanupCron', () => {
  let cron: TokenCleanupCron;
  let refreshTokenRepo: DeepMocked<Repository<RefreshToken>>;
  let activationTokenRepo: DeepMocked<Repository<ActivationToken>>;

  beforeEach(async () => {
    refreshTokenRepo = createMock<Repository<RefreshToken>>();
    activationTokenRepo = createMock<Repository<ActivationToken>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCleanupCron,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepo,
        },
        {
          provide: getRepositoryToken(ActivationToken),
          useValue: activationTokenRepo,
        },
      ],
    }).compile();

    cron = module.get<TokenCleanupCron>(TokenCleanupCron);
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  describe('handleCron', () => {
    it('should delete expired refresh tokens and activation tokens successfully', async () => {
      refreshTokenRepo.delete.mockResolvedValue({
        affected: 3,
      } as DeleteResult);
      activationTokenRepo.delete.mockResolvedValue({
        affected: 2,
      } as DeleteResult);

      await cron.handleCron();

      expect(refreshTokenRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.anything(),
        }),
      );
      expect(activationTokenRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.anything(),
        }),
      );
    });

    it('should catch errors and not throw', async () => {
      refreshTokenRepo.delete.mockRejectedValue(new Error('Database error'));

      await expect(cron.handleCron()).resolves.toBeUndefined();
    });
  });
});
