import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Permission | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findManyByActions(actions: string[]): Promise<Permission[]> {
    return this.repository.find({
      where: { action: In(actions) },
    });
  }
}
