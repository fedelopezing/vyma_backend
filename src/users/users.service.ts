import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ActivationTokensService } from './activation-tokens.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly activationTokensService: ActivationTokensService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const executeCreate = async (activeManager: EntityManager) => {
      const randomPassword = randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const user = await this.usersRepository.create(
        {
          name: createUserDto.name,
          email: createUserDto.email,
          role: { id: createUserDto.roleId },
          isActive: false,
          passwordHash,
        },
        activeManager,
      );

      const rawToken = await this.activationTokensService.createToken(
        user.id,
        activeManager,
      );

      this.eventEmitter.emit('user.created', {
        user,
        activationToken: rawToken,
      });

      return user;
    };

    if (manager) {
      return executeCreate(manager);
    }
    return this.usersRepository.runTransaction((mgr) => executeCreate(mgr));
  }

  async findOneByEmailForLogin(email: string): Promise<User | null> {
    return this.usersRepository.findOneByEmailForLogin(email);
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOneById(id);
  }

  async findOneByUuid(uuid: string): Promise<User | null> {
    return this.usersRepository.findOneByUuid(uuid);
  }

  async findOneWithPermissions(id: number): Promise<User | null> {
    return this.usersRepository.findOneWithPermissions(id);
  }

  async findUsersByRoleId(roleId: number): Promise<{ id: number }[]> {
    return this.usersRepository.findUsersByRoleId(roleId);
  }
}
