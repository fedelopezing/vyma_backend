import { ApiProperty } from '@nestjs/swagger';

export class ManualScrapeResponseDto {
  @ApiProperty({
    example: 'Scraping manual de cotizaciones completado',
    description: 'Mensaje de resultado',
  })
  message: string;
}
