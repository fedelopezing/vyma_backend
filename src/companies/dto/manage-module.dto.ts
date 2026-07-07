import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyModule } from '../../common/constants/modules.enum';

export class ManageModuleDto {
  @ApiProperty({
    description: 'Módulo de la compañía a administrar',
    enum: CompanyModule,
    example: CompanyModule.NEWS,
  })
  @IsEnum(CompanyModule)
  @IsNotEmpty()
  module: CompanyModule;
}
