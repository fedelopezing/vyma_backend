import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import { EventRepository } from './repositories/event.repository';
import { EventsController } from './events.controller';
import { CompaniesModule } from '../companies/companies.module';
import { EVENT_REPOSITORY } from './interfaces/i-event-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), CompaniesModule],
  providers: [
    EventsService,
    {
      provide: EVENT_REPOSITORY,
      useClass: EventRepository,
    },
  ],
  controllers: [EventsController],
  exports: [EventsService, EVENT_REPOSITORY],
})
export class EventsModule {}
