import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Biolimpieza SRL',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'RUC / CUIT / NIF de la empresa',
    example: '80012345-1',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiProperty({
    description: 'Email de contacto de la empresa',
    example: 'info@biolimpieza.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({
    description: 'Teléfono de contacto de la empresa',
    example: '+595981123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Módulos activos contratados por la empresa',
    example: ['NEWS', 'ADS'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activeModules?: string[];

  @ApiProperty({
    description: 'Dominio personalizado de la empresa',
    example: 'ccps.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;
}
