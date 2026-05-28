import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID del rol a asignar',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  roleId: number;
}
