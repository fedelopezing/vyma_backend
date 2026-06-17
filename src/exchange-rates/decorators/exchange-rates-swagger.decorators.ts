import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeRatesResponseDto, ManualScrapeResponseDto } from '../dto';

export function ApiGetExchangeRates() {
  return applyDecorators(
    ApiTags('exchange-rates'),
    ApiOperation({ summary: 'Obtener cotizaciones actuales' }),
    ApiResponse({
      status: 200,
      description: 'Cotizaciones obtenidas exitosamente',
      type: ExchangeRatesResponseDto,
    }),
  );
}

export function ApiManualScrape() {
  return applyDecorators(
    ApiTags('exchange-rates'),
    ApiOperation({ summary: 'Forzar scraping manual de cotizaciones' }),
    ApiResponse({
      status: 200,
      description: 'Scraping manual ejecutado exitosamente',
      type: ManualScrapeResponseDto,
    }),
  );
}
