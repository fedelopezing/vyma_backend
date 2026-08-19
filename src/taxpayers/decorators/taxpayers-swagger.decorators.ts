import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { TaxpayerResponseDto, DvValidationResponseDto } from '../dto';

export const ApiLookupTaxpayer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Lookup de contribuyente por RUC o Cédula',
      description:
        'Busca en caché local (TTL: 7 días) y en el padrón público de la DNIT/SET de Paraguay. ' +
        'Calcula el DV por Módulo 11. En caso de caída externa, retorna DV calculado y habilita ingreso manual.',
    }),
    ApiQuery({
      name: 'document',
      required: true,
      type: String,
      example: '80012345',
    }),
    ApiQuery({ name: 'country', required: false, type: String, example: 'PY' }),
    ApiOkResponse({ type: TaxpayerResponseDto }),
    ApiBadRequestResponse({ description: 'Formato de documento inválido' }),
    ApiUnauthorizedResponse({ description: 'Token JWT ausente o expirado' }),
    ApiForbiddenResponse({ description: 'Rol no autorizado' }),
  );

export const ApiValidateDv = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Calcular DV sin consulta externa',
      description:
        'Calcula el DV de un RUC/Cédula por el algoritmo oficial Módulo 11 de Paraguay. Sin latencia externa.',
    }),
    ApiQuery({
      name: 'document',
      required: true,
      type: String,
      example: '80012345',
    }),
    ApiQuery({ name: 'country', required: false, type: String, example: 'PY' }),
    ApiOkResponse({ type: DvValidationResponseDto }),
  );

export const ApiSearchTaxpayer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Búsqueda de contribuyentes por razón social en caché',
      description:
        'Full-text search en caché local offline. Máx. 10 resultados.',
    }),
    ApiQuery({
      name: 'q',
      required: true,
      type: String,
      example: 'IMPORTADORA',
    }),
    ApiQuery({ name: 'country', required: false, type: String, example: 'PY' }),
    ApiOkResponse({ type: TaxpayerResponseDto, isArray: true }),
  );
