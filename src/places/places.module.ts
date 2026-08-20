import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { OsmNominatimProvider } from './providers/osm-nominatim.provider';
import { PLACES_PROVIDER } from './interfaces/i-places-provider.interface';

@Module({
  imports: [HttpModule],
  controllers: [PlacesController],
  providers: [
    PlacesService,
    {
      provide: PLACES_PROVIDER,
      useClass: OsmNominatimProvider,
    },
  ],
  exports: [PlacesService],
})
export class PlacesModule {}
