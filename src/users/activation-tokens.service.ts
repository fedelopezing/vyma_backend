import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ActivationToken } from './entities/activation-token.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class ActivationTokensService {
  constructor(
    @InjectRepository(ActivationToken)
    private readonly activationTokenRepository: Repository<ActivationToken>,
  ) {}

  async createToken(userId: number, manager?: EntityManager): Promise<string> {
    const rawToken = randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas de validez

    const repo = manager
      ? manager.getRepository(ActivationToken)
      : this.activationTokenRepository;

    const token = repo.create({
      tokenHash,
      expiresAt,
      user: { id: userId },
    });

    await repo.save(token);

    return rawToken;
  }

  async findActiveToken(hashedToken: string): Promise<ActivationToken | null> {
    return this.activationTokenRepository.findOne({
      where: { tokenHash: hashedToken, isUsed: false },
      relations: ['user'],
    });
  }

  async markAsUsed(id: number, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(ActivationToken)
      : this.activationTokenRepository;
    await repo.update(id, { isUsed: true });
  }
}
