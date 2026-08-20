import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  ValidateIf,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrimToUndefined } from '../../../common/decorators';
import {
  ClientType,
  TaxCondition,
  BusinessForm,
} from '../../constants/clients-enums';

export class CreateClientDto {
  @ApiProperty({ enum: ClientType, example: ClientType.PERSONA_JURIDICA })
  @IsEnum(ClientType)
  clientType: ClientType;

  @ApiProperty({
    example: '80012345-6',
    description: 'RUC con dígito verificador',
  })
  @IsString()
  @MaxLength(20)
  ruc: string;

  @ApiProperty({ example: 'Constructora ABC S.R.L.' })
  @IsString()
  @MaxLength(200)
  businessName: string;

  @ApiPropertyOptional({ example: 'ABC Construcciones' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fantasyName?: string;

  @ApiProperty({ enum: TaxCondition, default: TaxCondition.IVA_10 })
  @IsEnum(TaxCondition)
  taxCondition: TaxCondition;

  @ApiPropertyOptional({ enum: BusinessForm, example: BusinessForm.SRL })
  @IsOptional()
  @IsEnum(BusinessForm)
  businessForm?: BusinessForm;

  // Requerido solo si es Persona Física
  @ApiPropertyOptional({ description: 'Requerido para PERSONA_FISICA' })
  @ValidateIf((o) => o.clientType === ClientType.PERSONA_FISICA)
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Requerido para PERSONA_FISICA' })
  @ValidateIf((o) => o.clientType === ClientType.PERSONA_FISICA)
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Fecha de nacimiento (opcional)',
  })
  @IsOptional()
  @ValidateIf((o) => o.birthDate != null && o.birthDate !== '')
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'contacto@abc.com' })
  @IsOptional()
  @ValidateIf((o) => o.emailPrimary != null && o.emailPrimary !== '')
  @IsEmail()
  @MaxLength(150)
  @TrimToUndefined()
  emailPrimary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.emailSecondary != null && o.emailSecondary !== '')
  @IsEmail()
  @MaxLength(150)
  @TrimToUndefined()
  emailSecondary?: string;

  @ApiPropertyOptional({ example: '+59521123456' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Central' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fiscalDepartment?: string;

  @ApiPropertyOptional({ example: 'Asunción' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fiscalDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fiscalLocality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fiscalNeighborhood?: string;

  @ApiPropertyOptional({ example: 'Av. Mcal. López 1500' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fiscalAddress?: string;
}
