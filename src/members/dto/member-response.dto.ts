import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeType, Member, MemberStatus } from '../entities/member.entity';

class MarketingContactResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class MemberResponseDto {
  @ApiProperty({
    description: 'UUID of the member application/record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the associated tenant/company',
    example: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'Email address of the company',
    example: 'info@company.com',
  })
  email: string;

  @ApiProperty({
    description: 'Fee type chosen',
    enum: FeeType,
    example: FeeType.ANNUAL,
  })
  feeType: FeeType;

  @ApiProperty({ description: 'Name of the company', example: 'Acme Corp' })
  companyName: string;

  @ApiProperty({ description: 'Tax ID', example: '80001234-5' })
  taxId: string;

  @ApiProperty({ description: 'Physical address', example: '123 Main St' })
  address: string;

  @ApiProperty({ description: 'City', example: 'Asuncion' })
  city: string;

  @ApiProperty({ description: 'Country', example: 'Paraguay' })
  country: string;

  @ApiProperty({ description: 'Phone number', example: '+595981234567' })
  phone: string;

  @ApiProperty({ description: 'Business category', example: 'Technology' })
  category: string;

  @ApiProperty({ description: 'Representative Name', example: 'Jane Smith' })
  representativeName: string;

  @ApiProperty({
    description: 'Representative Email',
    example: 'jane@company.com',
  })
  representativeEmail: string;

  @ApiProperty({
    description: 'Representative Phone',
    example: '+595982111222',
  })
  representativePhone: string;

  @ApiPropertyOptional({
    description: 'Social media links',
    example: { linkedin: 'https://linkedin.com' },
  })
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Marketing contact details',
    type: MarketingContactResponseDto,
  })
  marketingContact?: MarketingContactResponseDto;

  @ApiPropertyOptional({
    description: 'Logo URL',
    example: 'https://res.cloudinary.com/logo.png',
  })
  logoUrl?: string;

  @ApiProperty({ description: 'Is featured in home page', example: false })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Application status',
    enum: MemberStatus,
    example: MemberStatus.PENDING,
  })
  status: MemberStatus;

  @ApiProperty({
    description: 'Current optimistic locking version',
    example: 1,
  })
  version: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  static fromEntity(member: Member): MemberResponseDto {
    const dto = new MemberResponseDto();
    dto.id = member.id;
    dto.companyId = Number(member.companyId);
    dto.email = member.email;
    dto.feeType = member.feeType;
    dto.companyName = member.companyName;
    dto.taxId = member.taxId;
    dto.address = member.address;
    dto.city = member.city;
    dto.country = member.country;
    dto.phone = member.phone;
    dto.category = member.category;
    dto.representativeName = member.representativeName;
    dto.representativeEmail = member.representativeEmail;
    dto.representativePhone = member.representativePhone;
    dto.socialLinks = member.socialLinks;
    if (member.marketingContact) {
      dto.marketingContact = {
        name: member.marketingContact.name,
        email: member.marketingContact.email,
        phone: member.marketingContact.phone,
      };
    }
    dto.logoUrl = member.logoUrl;
    dto.isFeatured = member.isFeatured;
    dto.status = member.status;
    dto.version = member.version;
    dto.createdAt = member.createdAt;
    return dto;
  }
}
