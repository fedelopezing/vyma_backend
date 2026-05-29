import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateProfessionDto {
  @ApiProperty({
    description: 'Nombre de la profesión',
    example: 'Plomero',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;
}
