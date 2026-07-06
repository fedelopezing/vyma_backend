import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { NewsCategory, NewsStatus } from '../entities/news.entity';
import { ParseOptionalQuery } from '../../common/decorators/parse-optional-query.decorator';

export class NewsPaginationDto {
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
    description: 'Filtrar por categoría',
    enum: NewsCategory,
    example: NewsCategory.NOTICIA,
  })
  @IsOptional()
  @ParseOptionalQuery()
  @IsEnum(NewsCategory)
  categoria?: NewsCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (solo disponible para endpoints admin)',
    enum: NewsStatus,
    example: NewsStatus.BORRADOR,
  })
  @IsOptional()
  @ParseOptionalQuery()
  @IsEnum(NewsStatus)
  estado?: NewsStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID de la empresa (portal)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsString()
  companyUuid?: string;

  companyId?: number;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (busca en título y resumen)',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
