import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { AstroWebhookListener } from './listeners/astro-webhook.listener';
import { NewsController } from './news.controller';
import { News } from './entities/news.entity';
import { NewsRepository } from './repositories/news.repository';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  providers: [NewsService, AstroWebhookListener, NewsRepository],
  controllers: [NewsController],
  exports: [NewsService, NewsRepository],
})
export class NewsModule {}
