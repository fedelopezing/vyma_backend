import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Dirección de correo electrónico del usuario',
    example: 'user@mail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Contraseña del usuario (debe contener al menos una mayúscula, una minúscula y un número)',
    example: 'Admin123!',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'Rol asignado al usuario',
    enum: ['client', 'professional', 'admin'],
    example: 'client',
  })
  @IsOptional()
  @IsEnum(['client', 'professional', 'admin'], {
    message: 'role must be either "client" or "professional"',
  })
  role?: 'client' | 'professional' | 'admin';
}
