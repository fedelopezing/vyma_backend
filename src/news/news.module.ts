import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { AstroWebhookListener } from './listeners/astro-webhook.listener';
import { NewsController } from './news.controller';
import { News } from './entities/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  providers: [NewsService, AstroWebhookListener],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
