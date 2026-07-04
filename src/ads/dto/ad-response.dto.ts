import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdResponseDto {
  @ApiProperty({
    description: 'Identificador único del anuncio (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'URL de Cloudinary para la imagen del banner en español',
    example: 'https://res.cloudinary.com/demo/image/upload/ads/banner-es.jpg',
  })
  imageUrlEs: string;

  @ApiPropertyOptional({
    description: 'URL de Cloudinary para la imagen del banner en inglés',
    example: 'https://res.cloudinary.com/demo/image/upload/ads/banner-en.jpg',
  })
  imageUrlEn: string | null;

  @ApiPropertyOptional({
    description: 'URL de redirección externa para el banner en español',
    example: 'https://empresa-patrocinadora.com/landing-es',
  })
  linkUrlEs: string | null;

  @ApiPropertyOptional({
    description: 'URL de redirección externa para el banner en inglés',
    example: 'https://empresa-patrocinadora.com/landing-en',
  })
  linkUrlEn: string | null;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad en español',
    example: 'Banner publicitario de Empresa XYZ',
  })
  altEs: string | null;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad en inglés',
    example: 'Advertising banner for Company XYZ',
  })
  altEn: string | null;

  @ApiProperty({
    description: 'Indica si el banner está activo y visible en el carrusel',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Orden de prioridad en el carrusel',
    example: 0,
  })
  order: number;

  @ApiProperty({
    description: 'ID de la empresa asociada al anuncio (tenant)',
    example: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'Fecha de creación del anuncio',
    example: '2026-07-04T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del anuncio',
    example: '2026-07-04T12:00:00.000Z',
  })
  updatedAt: Date;
}
