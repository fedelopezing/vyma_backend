import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { ProfessionsModule } from './professions/professions.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ServicesModule } from './services/services.module';
import { CommonModule } from './common/common.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ScheduleBreaksModule } from './schedule-breaks/schedule-breaks.module';
import { EmailModule } from './email/email.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    EventEmitterModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    SeedModule,
    AuthModule,
    ProfessionsModule,
    ProfilesModule,
    ServicesModule,
    CommonModule,
    SchedulesModule,
    ScheduleBreaksModule,
    EmailModule,
    WhatsappModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
