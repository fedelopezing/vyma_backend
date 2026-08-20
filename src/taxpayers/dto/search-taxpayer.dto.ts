import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';

export class SearchTaxpayerDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Término de búsqueda (alias de search)',
    example: 'IMPORTADORA',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Código de país ISO 3166-1 alpha-2',
    example: 'PY',
    default: 'PY',
  })
  @IsOptional()
  @IsString()
  country?: string = 'PY';
}
