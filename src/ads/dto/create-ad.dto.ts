import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAdDto {
  @ApiProperty({
    description:
      'URL de Cloudinary para la imagen del banner en español (obligatorio)',
    example: 'https://res.cloudinary.com/demo/image/upload/ads/banner-es.jpg',
    maxLength: 500,
  })
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  imageUrlEs: string;

  @ApiPropertyOptional({
    description: 'URL de Cloudinary para la imagen del banner en inglés',
    example: 'https://res.cloudinary.com/demo/image/upload/ads/banner-en.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrlEn?: string;

  @ApiPropertyOptional({
    description:
      'URL de redirección externa al hacer clic en el banner (español)',
    example: 'https://empresa-patrocinadora.com/landing-es',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkUrlEs?: string;

  @ApiPropertyOptional({
    description:
      'URL de redirección externa al hacer clic en el banner (inglés)',
    example: 'https://empresa-patrocinadora.com/landing-en',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkUrlEn?: string;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad del banner en español',
    example: 'Banner publicitario de Empresa XYZ - Soluciones de software',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altEs?: string;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad del banner en inglés',
    example: 'Advertising banner for Company XYZ - Software solutions',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altEn?: string;

  @ApiPropertyOptional({
    description: 'Indica si el banner está activo y visible en el carrusel',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Orden de prioridad en el carrusel (ascendente). Menor número = mayor prioridad.',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
