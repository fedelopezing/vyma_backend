import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EventOrganizer, EventStatus } from '../entities/event.entity';

export class EventResponseDto {
  @ApiProperty({ example: 'uuid-aqui' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'cena-networking-ccps-2025' })
  @Expose()
  slugEs: string;

  @ApiPropertyOptional({ example: 'ccps-networking-dinner-2025' })
  @Expose()
  slugEn: string | null;

  @ApiProperty({ example: 'Cena de Networking CCPS 2025' })
  @Expose()
  tituloEs: string;

  @ApiPropertyOptional({ example: 'CCPS Networking Dinner 2025' })
  @Expose()
  tituloEn: string | null;

  @ApiProperty({
    example: 'Una velada de networking para socios y empresarios.',
  })
  @Expose()
  resumenEs: string;

  @ApiPropertyOptional({ example: 'A networking evening for members.' })
  @Expose()
  resumenEn: string | null;

  @ApiProperty({ example: '<p>Descripción detallada del evento...</p>' })
  @Expose()
  contenidoEs: string;

  @ApiPropertyOptional({ example: '<p>Detailed event description...</p>' })
  @Expose()
  contenidoEn: string | null;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/event.jpg',
  })
  @Expose()
  imagenPortada: string;

  @ApiProperty({ example: '2025-10-15T19:00:00.000Z' })
  @Expose()
  fechaEvento: Date;

  @ApiPropertyOptional({ example: 'Hotel Sheraton, Av. España 1000, Asunción' })
  @Expose()
  ubicacionEs: string | null;

  @ApiPropertyOptional({ example: 'Hotel Sheraton, Av. España 1000, Asunción' })
  @Expose()
  ubicacionEn: string | null;

  @ApiPropertyOptional({
    example: 'https://eventbrite.com/e/ccps-networking-2025',
  })
  @Expose()
  linkRegistro: string | null;

  @ApiProperty({ enum: EventOrganizer, example: EventOrganizer.CCPS })
  @Expose()
  organizador: EventOrganizer;

  @ApiPropertyOptional({ example: 'Empresa XYZ S.A.' })
  @Expose()
  organizadorNombre: string | null;

  @ApiProperty({ enum: EventStatus, example: EventStatus.PUBLICADO })
  @Expose()
  estado: EventStatus;

  @ApiProperty({ example: '2025-09-01T12:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-09-10T08:30:00.000Z' })
  @Expose()
  updatedAt: Date;
}
