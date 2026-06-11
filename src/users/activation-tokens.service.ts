import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActivationToken } from './entities/activation-token.entity';
import { ActivationTokensRepository } from './repositories/activation-tokens.repository';
import { randomUUID } from 'crypto';
import { User } from './entities/user.entity';

@Injectable()
export class ActivationTokensService {
  constructor(
    private readonly activationTokensRepository: ActivationTokensRepository,
  ) {}

  async createToken(userId: number, manager?: EntityManager): Promise<string> {
    const rawToken = randomUUID();
    const tokenHash = rawToken;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas de validez

    await this.activationTokensRepository.deleteByUserId(userId, manager);

    const token = this.activationTokensRepository.create(
      {
        tokenHash,
        expiresAt,
        user: { id: userId } as User,
      },
      manager,
    );

    await this.activationTokensRepository.save(token, manager);

    return rawToken;
  }

  async findActiveToken(hashedToken: string): Promise<ActivationToken | null> {
    return this.activationTokensRepository.findActiveToken(hashedToken);
  }

  async markAsUsed(id: number, manager?: EntityManager): Promise<void> {
    await this.activationTokensRepository.update(id, { isUsed: true }, manager);
  }
}
