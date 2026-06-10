import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository, DeepPartial } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { runInTransaction } from '../../common/helpers/transaction.helper';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  async findOneByTokenWithUser(token: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: { uuid: token },
      relations: ['user', 'user.role'],
    });
  }

  async findOneByToken(token: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: { uuid: token },
    });
  }

  async updateRevokeStatusByUser(
    userId: number,
    isRevoked: boolean,
  ): Promise<void> {
    await this.repo.update({ user: { id: userId } }, { isRevoked });
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return this.repo.save(refreshToken);
  }

  create(data: DeepPartial<RefreshToken>): RefreshToken {
    return this.repo.create(data);
  }

  async runTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return runInTransaction(this.dataSource, async (qr) => work(qr.manager));
  }
}
