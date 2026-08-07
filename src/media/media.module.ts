import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryProvider],
  exports: [MediaService, CloudinaryProvider],
})
export class MediaModule {}
