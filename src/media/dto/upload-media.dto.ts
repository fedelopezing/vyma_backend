import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({
    example: 'news',
    description: 'Optional folder name inside the company directory',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
