import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClientType } from '../../constants/clients-enums';

export class QueryClientDto {
  @ApiPropertyOptional({ description: 'Página a consultar', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Resultados por página', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ClientType })
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fantasyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
