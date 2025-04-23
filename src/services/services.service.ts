import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { handleDBErrors } from '../common/helpers';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      const service = this.serviceRepository.create(createServiceDto);
      await this.serviceRepository.save(service);

      return {
        message: `El servicio ha sido creado correctamente!`,
        data: service,
      };
    } catch (error) {
      handleDBErrors('El servicio', error);
    }
  }

  async findAll(name?: string) {
    const query = this.serviceRepository.createQueryBuilder('service');

    if (name) {
      query.where('LOWER(service.name) LIKE :name', { name: `%${name.toLowerCase()}%` });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) throw new BadRequestException('El servicio no existe');

    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    try {
      const service = await this.serviceRepository.update(id, updateServiceDto);

      if (service.affected === 0) handleDBErrors('El servicio');

      return {
        message: `El servicio ha sido actualizado correctamente!`,
        data: updateServiceDto,
      };
    } catch (error) {
      handleDBErrors('El servicio', error);
    }
  }

  async remove(id: number) {
    try {
      const service = await this.serviceRepository.findOneBy({ id });
      await this.serviceRepository.softRemove(service);
      return { message: `El servicio fue eliminado correctamente!` };

    } catch (error) {
      handleDBErrors('El servicio', error);
    }
  }
}
