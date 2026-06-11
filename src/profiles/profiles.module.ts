import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from './entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfessionsModule } from '../professions/professions.module';
import { AuthModule } from '../auth/auth.module';
import { ProfilesRepository } from './repositories/profiles.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    ProfessionsModule,
    forwardRef(() => AuthModule),
  ],
  providers: [ProfilesService, ProfilesRepository],
  controllers: [ProfilesController],
  exports: [ProfilesService, ProfilesRepository],
})
export class ProfilesModule {}
