import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class AssignStaffDto {
  @ApiProperty({
    description: 'ID del miembro de staff a asignar',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  staffMemberId: number;

  @ApiProperty({
    description: 'Fecha de inicio de asignación (YYYY-MM-DD)',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;
}
