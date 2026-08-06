import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BasePaginationDto } from '../../../common/dto/base-pagination.dto';
import { ClientType } from '../../constants/clients-enums';

export class QueryClientDto extends BasePaginationDto {
  @ApiPropertyOptional({
    enum: ClientType,
    description: 'Tipo de cliente (PERSONA_FISICA | PERSONA_JURIDICA)',
  })
  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @ApiPropertyOptional({ description: 'Filtrar por RUC' })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional({ description: 'Filtrar por Nombre de Fantasía' })
  @IsOptional()
  @IsString()
  fantasyName?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo/inactivo' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}
