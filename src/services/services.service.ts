import { Injectable } from '@nestjs/common';
import { ServicesRepository } from './repositories/services.repository';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { handleDBErrors } from '../common/helpers';
import { ServiceNotFoundException } from './exceptions/service-not-found.exception';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(
    createServiceDto: CreateServiceDto,
  ): Promise<{ message: string; data?: Service }> {
    try {
      const service = this.servicesRepository.create(createServiceDto);
      await this.servicesRepository.save(service);

      return {
        message: `El servicio ha sido creado correctamente!`,
        data: service,
      };
    } catch (error) {
      handleDBErrors('El servicio', error);
    }
  }

  async findAll(name?: string): Promise<Service[]> {
    return await this.servicesRepository.findAll(name);
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.servicesRepository.findOneById(id);
    if (!service) throw new ServiceNotFoundException(id);

    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<{ message: string; data?: UpdateServiceDto }> {
    try {
      const service = await this.servicesRepository.update(
        id,
        updateServiceDto,
      );

      if (service.affected === 0) throw new ServiceNotFoundException(id);

      return {
        message: `El servicio ha sido actualizado correctamente!`,
        data: updateServiceDto,
      };
    } catch (error) {
      if (error instanceof ServiceNotFoundException) throw error;
      handleDBErrors('El servicio', error);
    }
  }

  async remove(id: number): Promise<{ message: string } | void> {
    const service = await this.findOne(id);
    try {
      await this.servicesRepository.softRemove(service);
      return { message: `El servicio fue eliminado correctamente!` };
    } catch (error) {
      handleDBErrors('El servicio', error);
    }
  }
}
