import { Injectable } from '@nestjs/common';
import { ProfessionsRepository } from './repositories/professions.repository';

import { CreateProfessionDto, UpdateProfessionDto } from './dto';
import { Profession } from './entities/profession.entity';
import { handleDBErrors } from '../common/helpers';
import { ProfessionNotFoundException } from './exceptions/profession-not-found.exception';

@Injectable()
export class ProfessionsService {
  constructor(private readonly professionsRepository: ProfessionsRepository) {}

  async create(
    createProfessionDto: CreateProfessionDto,
  ): Promise<{ message: string; data?: Profession }> {
    try {
      const profession = this.professionsRepository.create(createProfessionDto);
      await this.professionsRepository.save(profession);

      return {
        message: `La profesión ha sido creado correctamente!`,
        data: profession,
      };
    } catch (error) {
      handleDBErrors('La profesión', error);
    }
  }

  async findAll(): Promise<Profession[]> {
    return await this.professionsRepository.findAll();
  }

  async findOne(id: number): Promise<Profession> {
    const profession = await this.professionsRepository.findOneById(id);
    if (!profession) throw new ProfessionNotFoundException(id);

    return profession;
  }

  async update(
    id: number,
    updateProfessionDto: UpdateProfessionDto,
  ): Promise<{ message: string; data?: UpdateProfessionDto }> {
    try {
      const profession = await this.professionsRepository.update(
        id,
        updateProfessionDto,
      );
      if (profession.affected === 0) throw new ProfessionNotFoundException(id);

      return {
        message: `La profesión ha sido actualizado correctamente!`,
        data: updateProfessionDto,
      };
    } catch (error) {
      if (error instanceof ProfessionNotFoundException) throw error;
      handleDBErrors('La profesión', error);
    }
  }

  async remove(id: number): Promise<{ message: string } | void> {
    const profession = await this.findOne(id);
    try {
      await this.professionsRepository.softRemove(profession);
      return { message: `La profesión fue eliminado correctamente!` };
    } catch (error) {
      handleDBErrors('La profesión', error);
    }
  }
}
