import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Gender,
  ContractType,
  StaffStatus,
  PaymentType,
} from '../constants/staff-enums';

class DocumentUrlDto {
  @ApiProperty({ description: 'Title of the document', example: 'Front of CI' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Cloudinary URL',
    example: 'https://res.cloudinary.com/...',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Category of document', example: 'CI' })
  @IsString()
  @IsNotEmpty()
  category: string;
}

export class CreateStaffMemberDto {
  @ApiPropertyOptional({
    description: 'Optional User ID if linked to a system user',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'First name', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'National ID (Cédula)', example: '1234567' })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+595981123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'juan.perez@email.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Home address', example: 'Calle 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: Gender, default: Gender.OTHER })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Job position',
    default: 'Personal de Limpieza',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ enum: ContractType, default: ContractType.FULL_TIME })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ enum: StaffStatus, default: StaffStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiProperty({ description: 'Hire date', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  hireDate: Date;

  @ApiPropertyOptional({
    description: 'Assigned location or client',
    example: 'Sucursal Centro',
  })
  @IsOptional()
  @IsString()
  assignedLocation?: string;

  @ApiPropertyOptional({ description: 'Base salary in GS', example: 2798309 })
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @ApiPropertyOptional({ enum: PaymentType, default: PaymentType.MONTHLY })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({
    description: 'Hourly rate if applicable',
    example: 15000,
  })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Has IPS coverage', default: true })
  @IsOptional()
  @IsBoolean()
  hasIpsCoverage?: boolean;

  @ApiPropertyOptional({ description: 'Bank Name', example: 'Banco Itaú' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank Account Number',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ type: [DocumentUrlDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentUrlDto)
  documentUrls?: DocumentUrlDto[];
}
