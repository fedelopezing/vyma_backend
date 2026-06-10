import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource, DeepPartial } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    user: DeepPartial<User>,
    manager?: EntityManager,
  ): Promise<User> {
    const userRepo = manager ? manager.getRepository(User) : this.repository;
    const newUser = userRepo.create(user);

    try {
      return await userRepo.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  async findOneByEmailForLogin(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: {
        email: true,
        passwordHash: true,
        isActive: true,
        id: true,
        name: true,
        role: { id: true, name: true },
      },
      relations: ['profile', 'role'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id }, relations: ['role'] });
  }

  async findOneWithPermissions(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
      select: {
        id: true,
        role: {
          id: true,
          permissions: {
            action: true,
          },
        },
      },
    });
  }

  async findUsersByRoleId(roleId: number): Promise<{ id: number }[]> {
    return this.repository.find({
      where: { role: { id: roleId } },
      select: ['id'],
    });
  }
}
