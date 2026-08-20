import { PlaceResponseDto } from '../dto/place-response.dto';

export const PLACES_PROVIDER = 'PLACES_PROVIDER';

export interface IPlacesProvider {
  search(query: string, limit: number): Promise<PlaceResponseDto[]>;
  reverse?(lat: number, lon: number): Promise<PlaceResponseDto>;
}
