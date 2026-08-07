import { ApiProperty } from '@nestjs/swagger';
import {
  StaffStatus,
  ContractType,
  PaymentType,
  Gender,
} from '../constants/staff-enums';
import { StaffMember } from '../entities/staff-member.entity';

class DocumentUrlDto {
  @ApiProperty({ description: 'Title of the document', example: 'Front of CI' })
  title: string;

  @ApiProperty({
    description: 'Cloudinary URL',
    example: 'https://res.cloudinary.com/...',
  })
  url: string;

  @ApiProperty({ description: 'Category of document', example: 'CI' })
  category: string;
}

export class StaffMemberResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  uuid: string;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 2, nullable: true })
  userId: number | null;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ example: '1234567' })
  nationalId: string;

  @ApiProperty({ example: '+595981123456', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'juan.perez@email.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'Calle 123', nullable: true })
  address: string | null;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ example: '1990-01-01', nullable: true })
  birthDate: Date | null;

  @ApiProperty({ example: 'Personal de Limpieza' })
  position: string;

  @ApiProperty({ enum: ContractType })
  contractType: ContractType;

  @ApiProperty({ enum: StaffStatus })
  status: StaffStatus;

  @ApiProperty({ example: '2024-01-01' })
  hireDate: Date;

  @ApiProperty({ example: '2025-01-01', nullable: true })
  terminationDate: Date | null;

  @ApiProperty({ example: 2798309 })
  baseSalary: number;

  @ApiProperty({ enum: PaymentType })
  paymentType: PaymentType;

  @ApiProperty({ example: 15000, nullable: true })
  hourlyRate: number | null;

  @ApiProperty({ example: true })
  hasIpsCoverage: boolean;

  @ApiProperty({ example: 'Banco Itaú', nullable: true })
  bankName: string | null;

  @ApiProperty({ example: '123456789', nullable: true })
  bankAccountNumber: string | null;

  @ApiProperty({ type: [DocumentUrlDto], nullable: true })
  documentUrls: DocumentUrlDto[] | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;

  constructor(entity: StaffMember) {
    this.id = Number(entity.id);
    this.uuid = entity.uuid;
    this.companyId = Number(entity.companyId);
    this.userId = entity.userId ? Number(entity.userId) : null;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.nationalId = entity.nationalId;
    this.phone = entity.phone;
    this.email = entity.email;
    this.address = entity.address;
    this.gender = entity.gender;
    this.birthDate = entity.birthDate;
    this.position = entity.position;
    this.contractType = entity.contractType;
    this.status = entity.status;
    this.hireDate = entity.hireDate;
    this.terminationDate = entity.terminationDate;
    this.baseSalary = Number(entity.baseSalary);
    this.paymentType = entity.paymentType;
    this.hourlyRate = entity.hourlyRate ? Number(entity.hourlyRate) : null;
    this.hasIpsCoverage = entity.hasIpsCoverage;
    this.bankName = entity.bankName;
    this.bankAccountNumber = entity.bankAccountNumber;
    this.documentUrls = entity.documentUrls;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

export class PaginatedStaffResponseDto {
  @ApiProperty({ type: [StaffMemberResponseDto] })
  data: StaffMemberResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
