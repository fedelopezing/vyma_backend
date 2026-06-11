import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profession } from '../entities/profession.entity';
import { CreateProfessionDto } from '../dto/create-profession.dto';
import { UpdateProfessionDto } from '../dto/update-profession.dto';

@Injectable()
export class ProfessionsRepository {
  constructor(
    @InjectRepository(Profession)
    private readonly repository: Repository<Profession>,
  ) {}

  create(createProfessionDto: CreateProfessionDto): Profession {
    return this.repository.create(createProfessionDto);
  }

  async save(profession: Profession): Promise<Profession> {
    return this.repository.save(profession);
  }

  async findAll(): Promise<Profession[]> {
    return this.repository.find();
  }

  async findOneById(id: number): Promise<Profession | null> {
    return this.repository.findOneBy({ id });
  }

  async update(id: number, updateProfessionDto: UpdateProfessionDto) {
    return this.repository.update(id, updateProfessionDto);
  }

  async softRemove(profession: Profession): Promise<Profession> {
    return this.repository.softRemove(profession);
  }
}
