import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token activo',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
