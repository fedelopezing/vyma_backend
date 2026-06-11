import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(Service)
    private readonly repository: Repository<Service>,
  ) {}

  create(createServiceDto: CreateServiceDto): Service {
    return this.repository.create(createServiceDto);
  }

  async save(service: Service): Promise<Service> {
    return this.repository.save(service);
  }

  async findAll(name?: string): Promise<Service[]> {
    const query = this.repository.createQueryBuilder('service');

    if (name) {
      query.where('LOWER(service.name) LIKE :name', {
        name: `%${name.toLowerCase()}%`,
      });
    }

    return await query.getMany();
  }

  async findOneById(id: number): Promise<Service | null> {
    return this.repository.findOneBy({ id });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.repository.update(id, updateServiceDto);
  }

  async softRemove(service: Service): Promise<Service> {
    return this.repository.softRemove(service);
  }
}
