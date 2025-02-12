import { forwardRef, Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { AuthModule } from '../auth/auth.module';
import { ProfessionsModule } from '../professions/professions.module';
import { Schedule } from './entities/schedule.entity';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [
    TypeOrmModule.forFeature([Schedule]),
  ],
})
export class SchedulesModule {}
