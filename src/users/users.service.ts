import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ActivationTokensService } from './activation-tokens.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { runInTransaction } from '../common/helpers/transaction.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly activationTokensService: ActivationTokensService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const executeCreate = async (activeManager: EntityManager) => {
      const userRepo = activeManager.getRepository(User);

      const randomPassword = randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const user = userRepo.create({
        name: createUserDto.name,
        email: createUserDto.email,
        role: { id: createUserDto.roleId },
        isActive: false,
        passwordHash,
      });

      await userRepo.save(user);

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
    return runInTransaction(this.dataSource, (qr) => executeCreate(qr.manager));
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

  async findUsersByRoleId(roleId: number): Promise<{ id: number }[]> {
    return this.userRepository.find({
      where: { role: { id: roleId } },
      select: ['id'],
    });
  }
}
