import { Module } from '@nestjs/common';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './entities/profession.entity';
import { ProfessionsRepository } from './repositories/professions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
  providers: [ProfessionsService, ProfessionsRepository],
  controllers: [ProfessionsController],
  exports: [ProfessionsService, ProfessionsRepository],
})
export class ProfessionsModule {}
