import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LookupTaxpayerDto {
  @ApiProperty({
    description: 'Número de RUC o Cédula de Identidad (con o sin DV)',
    example: '80012345',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  @Matches(/^[\d-]+$/, {
    message: 'El documento solo debe contener números y guiones',
  })
  document: string;

  @ApiPropertyOptional({
    description: 'Código de país ISO 3166-1 alpha-2',
    example: 'PY',
    default: 'PY',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string = 'PY';
}
