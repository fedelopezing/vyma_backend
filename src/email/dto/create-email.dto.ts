import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

export class CreateEmailDto {
  @ApiProperty({
    description: 'Correo electrónico del remitente',
    example: 'cliente@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nombre del remitente',
    example: 'Carlos Gómez',
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({
    description: 'Asunto del correo',
    example: 'Solicitud de presupuesto de limpieza',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+595981123456',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Ciudad de residencia',
    example: 'Asunción',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Dirección física',
    example: 'Avda. Mcal. López 1234',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Detalles adicionales sobre la solicitud',
    example: 'Limpieza de oficinas de 200m2',
  })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({
    description: 'Mensaje personalizado',
    example: 'Hola, me gustaría solicitar un presupuesto detallado.',
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    description: 'Plan seleccionado',
    example: 'Plan Premium',
  })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiPropertyOptional({
    description: 'Pregunta o consulta del usuario',
    example: '¿Tienen disponibilidad los fines de semana?',
  })
  @IsString()
  @IsOptional()
  question?: string;
}
