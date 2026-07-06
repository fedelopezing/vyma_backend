import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { EventOrganizer, EventStatus } from '../entities/event.entity';
import { ParseOptionalQuery } from '../../common/decorators/parse-optional-query.decorator';

export class EventsPaginationDto {
  @ApiPropertyOptional({
    description: 'Número de página (comienza en 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página (máximo 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de organizador',
    enum: EventOrganizer,
    example: EventOrganizer.CCPS,
  })
  @IsOptional()
  @ParseOptionalQuery()
  @IsEnum(EventOrganizer)
  organizador?: EventOrganizer;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (solo disponible para endpoints admin)',
    enum: EventStatus,
    example: EventStatus.BORRADOR,
  })
  @IsOptional()
  @ParseOptionalQuery()
  @IsEnum(EventStatus)
  estado?: EventStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID de la empresa',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsString()
  companyUuid?: string;

  companyId?: number;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (busca en título y resumen, bilingüe)',
    example: 'networking',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
