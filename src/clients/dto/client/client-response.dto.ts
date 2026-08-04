import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientType, TaxCondition, BusinessForm } from '../../constants/clients-enums';
import { EstablishmentResponseDto } from '../establishment/establishment-response.dto';
import { ClientRepresentativeResponseDto } from '../representative/client-representative-response.dto';

export class ClientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: number;

  @ApiProperty({ enum: ClientType })
  clientType: ClientType;

  @ApiProperty()
  ruc: string;

  @ApiProperty()
  businessName: string;

  @ApiPropertyOptional()
  fantasyName: string | null;

  @ApiProperty({ enum: TaxCondition })
  taxCondition: TaxCondition;

  @ApiPropertyOptional({ enum: BusinessForm })
  businessForm: BusinessForm | null;

  @ApiPropertyOptional()
  firstName: string | null;

  @ApiPropertyOptional()
  lastName: string | null;

  @ApiPropertyOptional({ type: String, format: 'date' })
  birthDate: Date | null;

  @ApiPropertyOptional()
  emailPrimary: string | null;

  @ApiPropertyOptional()
  emailSecondary: string | null;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  fiscalDepartment: string | null;

  @ApiPropertyOptional()
  fiscalDistrict: string | null;

  @ApiPropertyOptional()
  fiscalLocality: string | null;

  @ApiPropertyOptional()
  fiscalNeighborhood: string | null;

  @ApiPropertyOptional()
  fiscalAddress: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [ClientRepresentativeResponseDto] })
  representatives?: ClientRepresentativeResponseDto[];

  @ApiPropertyOptional({ type: () => [EstablishmentResponseDto] })
  establishments?: EstablishmentResponseDto[];
}

export class PaginatedClientResponseDto {
  @ApiProperty({ type: () => [ClientResponseDto] })
  data: ClientResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
