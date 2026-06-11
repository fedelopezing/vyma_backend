import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.repository.find({ relations: ['permissions'] });
  }

  async findOneById(id: number): Promise<Role | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async remove(role: Role): Promise<Role> {
    return this.repository.remove(role);
  }

  create(roleData: DeepPartial<Role>): Role {
    return this.repository.create(roleData);
  }

  async save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }
}
