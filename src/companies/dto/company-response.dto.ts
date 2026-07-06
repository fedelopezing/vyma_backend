import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'UUID de la empresa',
    example: 'd3f4a1b2-c3d4-4e5f-af6e-7a8b9c0d1e2f',
  })
  uuid: string;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Biolimpieza SRL',
  })
  name: string;

  @ApiProperty({
    description: 'RUC / CUIT / NIF de la empresa',
    example: '80012345-1',
    nullable: true,
  })
  taxId: string | null;

  @ApiProperty({
    description: 'Email de contacto de la empresa',
    example: 'info@biolimpieza.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Teléfono de contacto de la empresa',
    example: '+595981123456',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Indica si la empresa está activa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Módulos activos contratados por la empresa',
    example: ['NEWS', 'ADS'],
  })
  activeModules: string[];

  @ApiProperty({
    description: 'Dominio personalizado de la empresa',
    example: 'ccps.com',
    nullable: true,
  })
  domain: string | null;

  @ApiProperty({
    description: 'Fecha de creación de la empresa',
    example: '2026-06-15T18:00:00Z',
  })
  createdAt: Date;
}
