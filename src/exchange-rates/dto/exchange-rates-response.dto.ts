import { ApiProperty } from '@nestjs/swagger';
import { RateDto } from './rate.dto';

export class ExchangeRatesResponseDto {
  @ApiProperty({
    type: [RateDto],
    description: 'Lista de cotizaciones actuales',
  })
  rates: RateDto[];
}
