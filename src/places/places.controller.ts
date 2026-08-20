import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { PlacesService } from './places.service';
import { SearchPlaceDto, PlaceResponseDto } from './dto';
import { ApiGetPlacesSearch } from './decorators/places-swagger.decorators';

@ApiTags('Places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('search')
  @ApiGetPlacesSearch()
  async search(
    @Query() searchDto: SearchPlaceDto,
  ): Promise<PlaceResponseDto[]> {
    return this.placesService.search(searchDto);
  }
}
