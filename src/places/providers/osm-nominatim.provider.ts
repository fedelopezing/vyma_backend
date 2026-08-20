import {
  Injectable,
  Logger,
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IPlacesProvider } from '../interfaces/i-places-provider.interface';
import { PlaceResponseDto } from '../dto/place-response.dto';

@Injectable()
export class OsmNominatimProvider implements IPlacesProvider {
  private readonly logger = new Logger(OsmNominatimProvider.name);
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly userAgent = 'VymaBackend/1.0 (info@puntocode.com.py)';

  constructor(private readonly httpService: HttpService) {}

  async search(query: string, limit: number): Promise<PlaceResponseDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            countrycodes: 'py',
            limit,
          },
          headers: {
            'User-Agent': this.userAgent,
          },
        }),
      );

      const data = response.data;

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((item: Record<string, unknown>) => ({
        lat: parseFloat(item.lat as string),
        lon: parseFloat(item.lon as string),
        displayName: item.display_name as string,
        city: ((item.address as Record<string, unknown>)?.city ||
          (item.address as Record<string, unknown>)?.town ||
          (item.address as Record<string, unknown>)?.village) as string,
        state: (item.address as Record<string, unknown>)?.state as string,
        country: (item.address as Record<string, unknown>)?.country as string,
        type: item.type as string,
      }));
    } catch (error) {
      this.logger.error(
        `Error connecting to Nominatim API: ${error.message}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'El servicio de geolocalización no está disponible temporalmente.',
      );
    }
  }

  async reverse?(_lat: number, _lon: number): Promise<PlaceResponseDto> {
    throw new NotImplementedException('Method not implemented.');
  }
}
