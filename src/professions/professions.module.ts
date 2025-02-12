import { Module } from '@nestjs/common';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './entities/profession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profession])],
  providers: [ProfessionsService],
  controllers: [ProfessionsController],
  exports: [ProfessionsService],
})
export class ProfessionsModule {}
