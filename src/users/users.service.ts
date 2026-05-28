import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    userData: Partial<User>,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const user = repo.create(userData);
    await repo.save(user);
    return user;
  }

  async findOneByEmailForLogin(email: string): Promise<User | null> {
    return this.userRepository.findOne({
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
    return this.userRepository.findOne({ where: { id }, relations: ['role'] });
  }

  async findOneWithPermissions(id: number): Promise<User | null> {
    return this.userRepository.findOne({
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
}
