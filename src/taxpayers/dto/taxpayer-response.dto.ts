import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxpayerStatus, TaxpayerType } from '../constants/taxpayers-enums';

export class TaxpayerResponseDto {
  @ApiProperty({ example: true })
  found: boolean;

  @ApiProperty({ example: '80012345' })
  documentNumber: string;

  @ApiProperty({ description: 'Dígito Verificador', example: '6' })
  dv: string;

  @ApiProperty({ example: '80012345-6' })
  ruc: string;

  @ApiPropertyOptional({ example: 'IMPORTADORA Y EXPORTADORA S.A.' })
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Nombres (persona física)',
    example: 'JUAN CARLOS',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellidos (persona física)',
    example: 'GONZALEZ LOPEZ',
  })
  lastName?: string;

  @ApiPropertyOptional({ enum: TaxpayerType })
  taxpayerType?: TaxpayerType | string;

  @ApiPropertyOptional({ enum: TaxpayerStatus })
  status?: TaxpayerStatus | string;

  @ApiPropertyOptional({ example: 'Avda. Mariscal López 1234, Asunción' })
  address?: string;

  @ApiPropertyOptional({ example: 'Asunción' })
  city?: string;

  @ApiPropertyOptional({ example: '021123456' })
  phone?: string;

  @ApiPropertyOptional({ example: 'contacto@empresa.com.py' })
  email?: string;

  @ApiPropertyOptional({ example: 'Comercio al por mayor y menor' })
  economicActivity?: string;

  @ApiProperty({
    description: 'Resultado provino del caché local',
    example: true,
  })
  fromCache: boolean;

  @ApiProperty({
    description: 'Se requiere completar campos manualmente',
    example: false,
  })
  manualEntryRequired: boolean;

  @ApiPropertyOptional({
    description: 'Última sincronización con proveedor',
    example: '2026-08-19T12:00:00Z',
  })
  lastSyncedAt?: Date;
}

export class DvValidationResponseDto {
  @ApiProperty({ example: '80012345' })
  documentNumber: string;

  @ApiProperty({ description: 'DV calculado', example: '6' })
  dv: string;

  @ApiProperty({ example: '80012345-6' })
  ruc: string;
}
