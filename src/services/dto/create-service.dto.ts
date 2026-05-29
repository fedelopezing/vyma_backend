import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nombre del servicio prestado',
    example: 'Limpieza de Alfombras',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del servicio',
    example: 'Limpieza profunda y desinfección de alfombras residenciales y de oficinas.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Duración estimada del servicio en minutos',
    example: 60,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  durationMinutes: number;

  @ApiProperty({
    description: 'Precio del servicio',
    example: 150000,
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsPositive()
  price: number;
}
