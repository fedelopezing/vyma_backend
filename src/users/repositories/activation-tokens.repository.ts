import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ActivationToken } from '../entities/activation-token.entity';

@Injectable()
export class ActivationTokensRepository {
  constructor(
    @InjectRepository(ActivationToken)
    private readonly repository: Repository<ActivationToken>,
  ) {}

  async deleteByUserId(userId: number, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(ActivationToken)
      : this.repository;
    await repo.delete({ user: { id: userId } });
  }

  create(
    tokenData: Partial<ActivationToken>,
    manager?: EntityManager,
  ): ActivationToken {
    const repo = manager
      ? manager.getRepository(ActivationToken)
      : this.repository;
    return repo.create(tokenData);
  }

  async save(
    token: ActivationToken,
    manager?: EntityManager,
  ): Promise<ActivationToken> {
    const repo = manager
      ? manager.getRepository(ActivationToken)
      : this.repository;
    return repo.save(token);
  }

  async findActiveToken(hashedToken: string): Promise<ActivationToken | null> {
    return this.repository.findOne({
      where: { tokenHash: hashedToken, isUsed: false },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    data: Partial<ActivationToken>,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(ActivationToken)
      : this.repository;
    await repo.update(id, data);
  }
}
