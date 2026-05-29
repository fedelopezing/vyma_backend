import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getErrorStack } from '../common/helpers/errors.helper';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/entities/role.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateUserWithProfileDto } from '../profiles/dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ProfilesService))
    private readonly profileService: ProfilesService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new user in the database.
   * @param createUserDto - Data Transfer Object containing user creation details.
   * @param manager - Optional manager instance to use for database operations. Defaults to `this.dataSource.manager`.
   * @returns An object containing the created user and a JWT token.
   */
  async create(
    createUserDto: CreateUserDto,
    manager = this.dataSource.manager,
  ) {
    const roleRepo = manager.getRepository(Role);
    const roleName = createUserDto.role || 'client';
    const role = await roleRepo.findOne({ where: { name: roleName } });

    if (!role) {
      throw new BadRequestException(`Role '${roleName}' not found`);
    }

    const user = await this.usersService.create(
      {
        email: createUserDto.email,
        name: createUserDto.name,
        role: role,
        passwordHash: bcrypt.hashSync(createUserDto.password, 10),
      },
      manager,
    );
    delete user.passwordHash;
    return user;
  }

  /**
   * Registers a new user and creates their profile within a single transaction.
   * @param createUserDto - Data Transfer Object containing user and profile creation details.
   * @returns An object containing the created user and a JWT token.
   */
  async registerWithProfile(createUserDto: CreateUserWithProfileDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Create user
        createUserDto.role = 'client';
        const user = await this.create(createUserDto, manager);

        // Create profile to attach to user
        await this.profileService.create(
          { userId: user.id, professionId: createUserDto.professionId },
          manager,
        );

        return {
          user,
          token: this.getJwtToken({ id: user.id }),
        };
      } catch (error) {
        this.handleDBErrors(error);
      }
    });
  }

  /**
   * Authenticate a user and generate an access token
   * @param loginUserDto - DTO containing the user's email and password
   * @returns An object containing the access token
   * @throws UnauthorizedException If the user does not exist or the password is invalid
   */
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    // Buscar usuario por correo
    const user = await this.usersService.findOneByEmailForLogin(email);

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // Verificar si el usuario est  activo
    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Comparar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.profile?.avatarUrl || null,
        gender: user.profile?.gender || null,
        birthdate: user.profile?.birthDate || null,
      },
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  /**
   * Handle database errors
   * @param error The error object
   * @throws BadRequestException If the error is a duplicate key error
   * @throws InternalServerErrorException If the error is not a duplicate key error
   */
  handleDBErrors(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as Record<string, unknown>).code === '23505'
    ) {
      throw new ConflictException(
        'El email ya está en uso. Por favor, usa otro.',
      );
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as Record<string, unknown>).response;
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        throw new BadRequestException(
          (response as Record<string, unknown>).message,
        );
      }
    }

    this.logger.error('Unexpected database error', getErrorStack(error));
    throw new InternalServerErrorException(
      'Error inesperado, revise los logs del servidor',
    );
  }

  public getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
