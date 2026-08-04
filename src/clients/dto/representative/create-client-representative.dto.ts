import { IsEnum, IsString, IsOptional, MaxLength, ValidateIf, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepresentativeRole, DocumentType } from '../../constants/clients-enums';

export class CreateClientRepresentativeDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ enum: DocumentType, default: DocumentType.CEDULA_PY })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  documentNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  maritalStatus?: string;

  @ApiProperty({ enum: RepresentativeRole })
  @IsEnum(RepresentativeRole)
  role: RepresentativeRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  professionalRegistrationNumber?: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsString()
  roleStartDate?: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsString()
  roleEndDate?: string;

  // Campos específicos de SOCIO
  @ApiPropertyOptional({ description: 'Requerido si role es SOCIO' })
  @ValidateIf((o) => o.role === RepresentativeRole.SOCIO)
  @IsNumber()
  @Min(0)
  sharesCount?: number;

  @ApiPropertyOptional({ description: 'Requerido si role es SOCIO' })
  @ValidateIf((o) => o.role === RepresentativeRole.SOCIO)
  @IsNumber()
  @Min(0)
  shareValue?: number;

  @ApiPropertyOptional({ description: 'Requerido si role es SOCIO' })
  @ValidateIf((o) => o.role === RepresentativeRole.SOCIO)
  @IsNumber()
  @Min(0)
  totalSharesValue?: number;
}
