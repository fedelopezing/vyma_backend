import { IsUUID, IsNotEmpty, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({
    description: 'UUID del usuario a agregar a la empresa',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsUUID()
  @IsNotEmpty()
  userUuid: string;

  @ApiProperty({
    description: 'ID del rol a asignar al usuario en esta empresa',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  roleId: number;
}
