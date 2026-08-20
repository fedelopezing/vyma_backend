import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchPlaceDto {
  @ApiProperty({ description: 'Texto a buscar', example: 'Shopping del Sol' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ description: 'Límite de resultados', default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number = 5;
}
