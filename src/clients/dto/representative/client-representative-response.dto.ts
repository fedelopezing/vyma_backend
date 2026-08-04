import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepresentativeRole, DocumentType } from '../../constants/clients-enums';

export class ClientRepresentativeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty()
  documentNumber: string;

  @ApiPropertyOptional()
  nationality: string | null;

  @ApiPropertyOptional()
  gender: string | null;

  @ApiPropertyOptional()
  maritalStatus: string | null;

  @ApiProperty({ enum: RepresentativeRole })
  role: RepresentativeRole;

  @ApiPropertyOptional()
  profession: string | null;

  @ApiPropertyOptional()
  professionalRegistrationNumber: string | null;

  @ApiPropertyOptional({ type: String, format: 'date' })
  roleStartDate: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date' })
  roleEndDate: Date | null;

  @ApiPropertyOptional()
  sharesCount: number | null;

  @ApiPropertyOptional()
  shareValue: number | null;

  @ApiPropertyOptional()
  totalSharesValue: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
