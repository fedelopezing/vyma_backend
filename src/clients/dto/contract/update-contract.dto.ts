import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateContractDto } from './create-contract.dto';
import { ContractStatus } from '../../constants/clients-enums';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
