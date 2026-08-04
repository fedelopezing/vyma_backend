import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractResponseDto } from '../contract/contract-response.dto';

export class EstablishmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isHeadquarters: boolean;

  @ApiPropertyOptional()
  cadastralAccount: string | null;

  @ApiPropertyOptional()
  padronNumber: string | null;

  @ApiPropertyOptional()
  estateFincaNumber: string | null;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  email: string | null;

  @ApiPropertyOptional()
  address: string | null;

  @ApiPropertyOptional()
  locationReference: string | null;

  @ApiPropertyOptional()
  latitude: number | null;

  @ApiPropertyOptional()
  longitude: number | null;

  @ApiPropertyOptional()
  geofenceRadiusMeters: number | null;

  @ApiPropertyOptional()
  accessSchedules: Array<{ day: string; from: string; to: string }> | null;

  @ApiPropertyOptional()
  requiredPpe: string[] | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => [ContractResponseDto] })
  contracts?: ContractResponseDto[];

  @ApiPropertyOptional()
  staffAssignments?: any[]; // To be typed later with StaffAssignmentResponseDto
}
