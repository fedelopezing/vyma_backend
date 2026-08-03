import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { StaffStatus } from '../constants/staff-enums';

export class QueryStaffMemberDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by Company ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Search by first name, last name or CI' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StaffStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiPropertyOptional({
    description: 'Filter by position',
    example: 'Personal de Limpieza',
  })
  @IsOptional()
  @IsString()
  position?: string;
}
