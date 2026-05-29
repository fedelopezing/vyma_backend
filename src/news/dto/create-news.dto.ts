import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { NewsCategory, NewsStatus } from '../entities/news.entity';
import { SanitizeHtml } from '../../common/decorators/sanitize-html.decorator';

export class CreateNewsDto {
  @ApiProperty({
    description: 'Título de la noticia en español (obligatorio)',
    example: 'Apertura de nuevo centro de salud en Buenos Aires',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tituloEs: string;

  @ApiPropertyOptional({
    description:
      'Título de la noticia en inglés. Requerido si estado es PUBLICADO.',
    example: 'Opening of new health center in Buenos Aires',
    maxLength: 255,
  })
  @ValidateIf((o: CreateNewsDto) => o.estado === NewsStatus.PUBLICADO)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tituloEn?: string;

  @ApiProperty({
    description: 'Resumen de la noticia en español (obligatorio)',
    example:
      'El nuevo centro de salud brindará atención primaria a más de 5000 personas.',
  })
  @IsString()
  @IsNotEmpty()
  resumenEs: string;

  @ApiPropertyOptional({
    description:
      'Resumen de la noticia en inglés. Requerido si estado es PUBLICADO.',
    example:
      'The new health center will provide primary care to over 5000 people.',
  })
  @ValidateIf((o: CreateNewsDto) => o.estado === NewsStatus.PUBLICADO)
  @IsString()
  @IsNotEmpty()
  resumenEn?: string;

  @ApiProperty({
    description:
      'Contenido HTML enriquecido de la noticia en español. Se sanitiza automáticamente.',
    example: '<p>Texto de la noticia...</p>',
  })
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  contenidoEs: string;

  @ApiPropertyOptional({
    description:
      'Contenido HTML en inglés. Se sanitiza automáticamente. Requerido si estado es PUBLICADO.',
    example: '<p>News content...</p>',
  })
  @ValidateIf((o: CreateNewsDto) => o.estado === NewsStatus.PUBLICADO)
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  contenidoEn?: string;

  @ApiProperty({
    description: 'URL de la imagen de portada (Cloudinary)',
    example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  imagenPortada: string;

  @ApiPropertyOptional({
    description: 'Categoría de la noticia',
    enum: NewsCategory,
    example: NewsCategory.NOTICIA,
  })
  @IsOptional()
  @IsEnum(NewsCategory)
  categoria?: NewsCategory;

  @ApiPropertyOptional({
    description: 'Estado de la publicación',
    enum: NewsStatus,
    example: NewsStatus.BORRADOR,
  })
  @IsOptional()
  @IsEnum(NewsStatus)
  estado?: NewsStatus;
}
