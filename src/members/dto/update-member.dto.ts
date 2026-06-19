import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApplyMemberDto } from './apply-member.dto';

export class UpdateMemberDto extends PartialType(
  OmitType(ApplyMemberDto, ['recaptchaToken', 'companyId'] as const),
) {
  @ApiPropertyOptional({
    description: 'Optimistic locking version number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  version?: number;
}
