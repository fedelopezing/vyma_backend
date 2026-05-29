import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserWithProfileDto {
  @ApiProperty({
    description: 'Correo electrónico del nuevo usuario',
    example: 'nuevo.usuario@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña de la cuenta',
    example: 'SecurePass456',
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
    description: 'Nombre del usuario',
    example: 'Sofía Martínez',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: ['client', 'professional', 'admin'],
    example: 'professional',
  })
  @IsOptional()
  @IsEnum(['client', 'professional', 'admin'], {
    message: 'role must be either "client" or "professional"',
  })
  role?: 'client' | 'professional' | 'admin';

  @ApiPropertyOptional({
    description: 'ID de la profesión (si el rol es professional)',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  professionId?: number;
}
