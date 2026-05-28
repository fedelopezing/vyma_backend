import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description:
      'La acción o nombre del permiso, usualmente con formato recurso:accion',
    example: 'create:news',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  action: string;
}
