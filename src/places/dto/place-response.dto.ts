import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlaceResponseDto {
  @ApiProperty({
    description: 'Latitud geográfica',
    example: -25.2818961,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitud geográfica',
    example: -57.5684613,
  })
  lon: number;

  @ApiProperty({
    description: 'Nombre completo o dirección formateada',
    example: 'Shopping del Sol, Aviadores del Chaco, Asunción',
  })
  displayName: string;

  @ApiPropertyOptional({
    description: 'Ciudad, pueblo o localidad',
    example: 'Asunción',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'Departamento o estado',
    example: 'Asunción',
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'País',
    example: 'Paraguay',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'Tipo o categoría del lugar',
    example: 'hotel',
  })
  type?: string;
}
