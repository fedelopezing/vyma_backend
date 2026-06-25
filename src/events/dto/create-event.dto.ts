import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventOrganizer, EventStatus } from '../entities/event.entity';
import { SanitizeHtml } from '../../common/decorators/sanitize-html.decorator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Título del evento en español (obligatorio)',
    example: 'Cena de Networking CCPS 2025',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tituloEs: string;

  @ApiPropertyOptional({
    description:
      'Título del evento en inglés. Requerido si estado es PUBLICADO.',
    example: 'CCPS Networking Dinner 2025',
    maxLength: 255,
  })
  @ValidateIf((o: CreateEventDto) => o.estado === EventStatus.PUBLICADO)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tituloEn?: string;

  @ApiProperty({
    description: 'Resumen del evento en español (obligatorio)',
    example: 'Una velada de networking para socios y empresarios.',
  })
  @IsString()
  @IsNotEmpty()
  resumenEs: string;

  @ApiPropertyOptional({
    description:
      'Resumen del evento en inglés. Requerido si estado es PUBLICADO.',
    example: 'A networking evening for members and entrepreneurs.',
  })
  @ValidateIf((o: CreateEventDto) => o.estado === EventStatus.PUBLICADO)
  @IsString()
  @IsNotEmpty()
  resumenEn?: string;

  @ApiProperty({
    description:
      'Contenido HTML enriquecido del evento en español. Se sanitiza automáticamente.',
    example: '<p>Descripción detallada del evento...</p>',
  })
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  contenidoEs: string;

  @ApiPropertyOptional({
    description:
      'Contenido HTML en inglés. Se sanitiza automáticamente. Requerido si estado es PUBLICADO.',
    example: '<p>Detailed event description...</p>',
  })
  @ValidateIf((o: CreateEventDto) => o.estado === EventStatus.PUBLICADO)
  @IsString()
  @IsNotEmpty()
  @SanitizeHtml()
  contenidoEn?: string;

  @ApiProperty({
    description: 'URL de la imagen de portada (Cloudinary)',
    example: 'https://res.cloudinary.com/demo/image/upload/event.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  imagenPortada: string;

  @ApiProperty({
    description:
      'Fecha y hora del evento en formato ISO 8601 con zona horaria (Paraguay: -04:00)',
    example: '2025-10-15T19:00:00-04:00',
  })
  @IsISO8601({ strict: true })
  @IsNotEmpty()
  fechaEvento: string;

  @ApiPropertyOptional({
    description:
      'Ubicación del evento en español (dirección física o "Virtual")',
    example: 'Hotel Sheraton, Av. España 1000, Asunción',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ubicacionEs?: string;

  @ApiPropertyOptional({
    description:
      'Ubicación del evento en inglés (physical address or "Virtual")',
    example: 'Hotel Sheraton, Av. España 1000, Asunción',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ubicacionEn?: string;

  @ApiPropertyOptional({
    description:
      'URL externa de registro (Eventbrite, Zoom, etc.). Si no se proporciona, el botón abrirá un modal de contacto.',
    example: 'https://eventbrite.com/e/ccps-networking-2025',
  })
  @IsOptional()
  @ValidateIf((o: CreateEventDto) => !!o.linkRegistro)
  @IsUrl()
  linkRegistro?: string;

  @ApiProperty({
    description: 'Tipo de organizador del evento',
    enum: EventOrganizer,
    example: EventOrganizer.CCPS,
  })
  @IsEnum(EventOrganizer)
  @IsNotEmpty()
  organizador: EventOrganizer;

  @ApiPropertyOptional({
    description:
      'Nombre del socio organizador. Requerido si organizador es SOCIO.',
    example: 'Empresa XYZ S.A.',
    maxLength: 255,
  })
  @ValidateIf((o: CreateEventDto) => o.organizador === EventOrganizer.SOCIO)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizadorNombre?: string;

  @ApiPropertyOptional({
    description: 'Estado de publicación del evento',
    enum: EventStatus,
    example: EventStatus.BORRADOR,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  estado?: EventStatus;
}
