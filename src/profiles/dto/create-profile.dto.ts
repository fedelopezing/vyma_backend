import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    description: 'ID del usuario asociado al perfil',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Especialista en mantenimiento e instalaciones eléctricas.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del perfil',
    example: '+595982765432',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección del perfil',
    example: 'Calle Palma 456',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento en formato timestamp',
    example: 631152000,
  })
  @IsOptional()
  @IsNumber()
  birthDate?: number;

  @ApiPropertyOptional({
    description: 'ID de la profesión asociada al perfil',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  professionId?: number;
}
