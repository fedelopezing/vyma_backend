import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

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
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { NewsModule } from './news/news.module';

import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),

    // Rate limiting global: 30 req / 60s por IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),

    SeedModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    ProfessionsModule,
    ProfilesModule,
    ServicesModule,
    CommonModule,
    SchedulesModule,
    ScheduleBreaksModule,
    EmailModule,
    WhatsappModule,
    UsersModule,
    NewsModule,
  ],
  controllers: [],
  providers: [
    // Aplica ThrottlerGuard globalmente a toda la aplicación
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
