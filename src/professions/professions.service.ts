import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProfessionDto, UpdateProfessionDto } from './dto';
import { Profession } from './entities/profession.entity';
import { handleDBErrors } from '../common/helpers';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private readonly professionRepository: Repository<Profession>,
  ) {}

  async create(createProfessionDto: CreateProfessionDto) {
    try {
      const profession = this.professionRepository.create(createProfessionDto);
      await this.professionRepository.save(profession);

      return {
        message: `La profesión ha sido creado correctamente!`,
        data: profession,
      };
    } catch (error) {
      handleDBErrors('La profesión', error);
    }
  }

  async findAll() {
    return await this.professionRepository.find();
  }

  async findOne(id: number) {
    const profession = await this.professionRepository.findOneBy({ id });
    if (!profession) throw new BadRequestException('La profesión no existe');

    return profession;
  }

  async update(id: number, updateProfessionDto: UpdateProfessionDto) {
    try {
      const profession = await this.professionRepository.update(id, updateProfessionDto);
      if (profession.affected === 0) handleDBErrors('La profesión');

      return {
        message: `La profesión ha sido actualizado correctamente!`,
        data: updateProfessionDto,
      };
    } catch (error) {
      handleDBErrors('La profesión', error);
    }
  }

  async remove(id: number) {
    try {
      const profession = await this.professionRepository.findOneBy({ id });
      await this.professionRepository.softRemove(profession);
      return { message: `La profesión fue eliminado correctamente!` };

    } catch (error) {
      handleDBErrors('La profesión', error);
    }
  }


}
