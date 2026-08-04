import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType, ContractStatus } from '../../constants/clients-enums';

export class ContractResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentId: string;

  @ApiProperty({ enum: ContractType })
  contractType: ContractType;

  @ApiProperty({ enum: ContractStatus })
  status: ContractStatus;

  @ApiProperty()
  monthlyAmount: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  hoursBundleTotal: number | null;

  @ApiPropertyOptional()
  hourlyRate: number | null;

  @ApiProperty({ type: String, format: 'date' })
  startDate: Date;

  @ApiPropertyOptional({ type: String, format: 'date' })
  endDate: Date | null;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
