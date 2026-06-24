import { ApiProperty } from '@nestjs/swagger';
import { MemberResponseDto } from './member-response.dto';
import { PaginatedResponse } from '../../common/interfaces';

class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class PaginatedMembersResponseDto
  implements PaginatedResponse<MemberResponseDto>
{
  @ApiProperty({ type: [MemberResponseDto] })
  data: MemberResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
