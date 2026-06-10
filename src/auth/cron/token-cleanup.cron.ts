import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ActivationToken } from '../../users/entities/activation-token.entity';

@Injectable()
export class TokenCleanupCron {
  private readonly logger = new Logger(TokenCleanupCron.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(ActivationToken)
    private readonly activationTokenRepo: Repository<ActivationToken>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Starting expired tokens cleanup...');

    try {
      const now = new Date();

      const refreshResult = await this.refreshTokenRepo.delete({
        expiresAt: LessThan(now),
      });
      this.logger.log(
        `Deleted ${refreshResult.affected} expired refresh tokens`,
      );

      const activationResult = await this.activationTokenRepo.delete({
        expiresAt: LessThan(now),
      });
      this.logger.log(
        `Deleted ${activationResult.affected} expired activation tokens`,
      );
    } catch (error) {
      this.logger.error('Error during tokens cleanup', error);
    }
  }
}
