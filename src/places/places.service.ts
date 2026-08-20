import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IPlacesProvider,
  PLACES_PROVIDER,
} from './interfaces/i-places-provider.interface';
import { SearchPlaceDto, PlaceResponseDto } from './dto';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);

  constructor(
    @Inject(PLACES_PROVIDER)
    private readonly placesProvider: IPlacesProvider,
  ) {}

  async search(searchDto: SearchPlaceDto): Promise<PlaceResponseDto[]> {
    try {
      this.logger.debug(`Searching for places with query: ${searchDto.q}`);
      return await this.placesProvider.search(
        searchDto.q,
        searchDto.limit ?? 5,
      );
    } catch (error) {
      this.logger.error(
        `Error searching places for query "${searchDto.q}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
