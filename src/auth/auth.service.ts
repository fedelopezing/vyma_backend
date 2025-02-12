import {
  BadRequestException, ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new user in the database.
   * @param createUserDto - Data Transfer Object containing user creation details.
   * @param manager - Optional manager instance to use for database operations. Defaults to `this.dataSource.manager`.
   * @returns An object containing the created user and a JWT token.
   */
  async create(createUserDto: CreateUserDto, manager = this.dataSource.manager) {
    const repo = manager.getRepository(User);

    const user = repo.create({
      email: createUserDto.email,
      name: createUserDto.name,
      role: createUserDto.role,
      passwordHash: bcrypt.hashSync(createUserDto.password, 10),
    });

    await repo.save(user);
    delete user.passwordHash;
    return user;
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
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, passwordHash: true, isActive: true, id: true },
    });

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
      access_token: this.getJwtToken({ id: user.id }),
    };
  }

  /**
   * Handle database errors
   * @param error The error object
   * @throws BadRequestException If the error is a duplicate key error
   * @throws InternalServerErrorException If the error is not a duplicate key error
   */
  handleDBErrors(error: any): never {
    if (error.code === '23505')
      throw new ConflictException('El email ya está en uso. Por favor, usa otro.');

    if (error.code === '23503')
      throw new BadRequestException('La profesión proporcionada no existe.');

    if (error.response?.message)
      throw new BadRequestException(error.response.message);

    throw new InternalServerErrorException('Error inesperado en la base de datos');
  }

  public getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
