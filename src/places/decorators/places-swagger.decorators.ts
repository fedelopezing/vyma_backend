import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { PlaceResponseDto } from '../dto';

export const ApiGetPlacesSearch = () =>
  applyDecorators(
    ApiOperation({ summary: 'Search for places by text (Geocoding)' }),
    ApiOkResponse({
      description: 'Returns a list of matching places with their coordinates',
      type: PlaceResponseDto,
      isArray: true,
    }),
    ApiServiceUnavailableResponse({
      description: 'Geolocation service is temporarily unavailable',
    }),
  );
