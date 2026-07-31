import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MediaResponseDto {
  @ApiProperty({ example: 'vyma/company-uuid/news/sample_id' })
  @IsString()
  publicId: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../sample.webp' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'webp' })
  @IsString()
  format: string;

  @ApiProperty({ example: 1080 })
  @IsNumber()
  width: number;

  @ApiProperty({ example: 720 })
  @IsNumber()
  height: number;

  @ApiProperty({ example: 124500 })
  @IsNumber()
  bytes: number;
}
