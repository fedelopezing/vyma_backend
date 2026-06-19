import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeType } from '../entities/member.entity';

class MarketingContactDto {
  @ApiProperty({
    description: 'Name of the marketing contact',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email of the marketing contact',
    example: 'marketing@company.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone of the marketing contact',
    example: '+123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ApplyMemberDto {
  @ApiProperty({
    description: 'ID of the company (Tenant) to apply for',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  companyId: number;

  @ApiProperty({
    description: 'Email of the applying company',
    example: 'info@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Selected fee type',
    enum: FeeType,
    example: FeeType.ANNUAL,
  })
  @IsEnum(FeeType)
  feeType: FeeType;

  @ApiProperty({
    description: 'Name of the applying company',
    example: 'Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Tax ID (RUC, CUIT, NIF)',
    example: '80001234-5',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiProperty({ description: 'Company address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'City', example: 'Asuncion' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Country', example: 'Paraguay' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+595981234567',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Business category or sector',
    example: 'Technology',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Name of the legal representative',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  representativeName: string;

  @ApiProperty({
    description: 'Email of the legal representative',
    example: 'jane@company.com',
  })
  @IsEmail()
  representativeEmail: string;

  @ApiProperty({
    description: 'Phone of the legal representative',
    example: '+595982111222',
  })
  @IsString()
  @IsNotEmpty()
  representativePhone: string;

  @ApiPropertyOptional({
    description: 'Social media links',
    example: { linkedin: 'url' },
  })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Marketing contact details',
    type: MarketingContactDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarketingContactDto)
  marketingContact?: MarketingContactDto;

  @ApiPropertyOptional({
    description: 'URL of the company logo from Cloudinary',
    example: 'https://res.cloudinary.com/...',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({
    description: 'reCAPTCHA token for validation',
    example: 'abc123token',
  })
  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}
