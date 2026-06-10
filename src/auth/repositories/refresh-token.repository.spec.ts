import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenRepository } from './refresh-token.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { DataSource } from 'typeorm';

describe('RefreshTokenRepository', () => {
  let repository: RefreshTokenRepository;
  const mockRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenRepository,
        { provide: getRepositoryToken(RefreshToken), useValue: mockRepo },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    repository = module.get<RefreshTokenRepository>(RefreshTokenRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should find one by token with user', async () => {
    mockRepo.findOne.mockResolvedValueOnce({ id: 1 });
    await repository.findOneByTokenWithUser('token123');
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { uuid: 'token123' },
      relations: ['user', 'user.role'],
    });
  });

  it('should find one by token', async () => {
    mockRepo.findOne.mockResolvedValueOnce({ id: 1 });
    await repository.findOneByToken('token123');
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { uuid: 'token123' },
    });
  });

  it('should update revoke status by user', async () => {
    mockRepo.update.mockResolvedValueOnce({});
    await repository.updateRevokeStatusByUser(1, true);
    expect(mockRepo.update).toHaveBeenCalledWith(
      { user: { id: 1 } },
      { isRevoked: true },
    );
  });

  it('should save a refresh token', async () => {
    const token = new RefreshToken();
    mockRepo.save.mockResolvedValueOnce(token);
    const result = await repository.save(token);
    expect(mockRepo.save).toHaveBeenCalledWith(token);
    expect(result).toBe(token);
  });

  it('should create a refresh token', () => {
    const data = { uuid: '123' };
    const token = new RefreshToken();
    mockRepo.create.mockReturnValue(token);
    const result = repository.create(data);
    expect(mockRepo.create).toHaveBeenCalledWith(data);
    expect(result).toBe(token);
  });
});
