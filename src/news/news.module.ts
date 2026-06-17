import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { AstroWebhookListener } from './listeners/astro-webhook.listener';
import { NewsController } from './news.controller';
import { News } from './entities/news.entity';
import { NewsRepository } from './repositories/news.repository';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([News]), CompaniesModule],
  providers: [NewsService, AstroWebhookListener, NewsRepository],
  controllers: [NewsController],
  exports: [NewsService, NewsRepository],
})
export class NewsModule {}
