import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ExchangeRatesResponseDto, ManualScrapeResponseDto } from '../dto';

export function ApiGetExchangeRates() {
  return applyDecorators(
    ApiTags('Exchange-rates'),
    ApiOperation({ summary: 'Obtener cotizaciones actuales' }),
    ApiQuery({
      name: 'companyUuid',
      required: true,
      type: String,
      description:
        'UUID de la empresa/tenant cuyas cotizaciones se desean obtener',
      example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    }),
    ApiResponse({
      status: 200,
      description: 'Cotizaciones obtenidas exitosamente',
      type: ExchangeRatesResponseDto,
    }),
  );
}

export function ApiManualScrape() {
  return applyDecorators(
    ApiTags('Exchange-rates'),
    ApiOperation({ summary: 'Forzar scraping manual de cotizaciones' }),
    ApiResponse({
      status: 200,
      description: 'Scraping manual ejecutado exitosamente',
      type: ManualScrapeResponseDto,
    }),
  );
}
