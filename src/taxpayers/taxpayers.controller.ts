import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TaxpayersService } from './taxpayers.service';
import { TaxpayersDirectoryService } from './taxpayers.directory.service';
import {
  LookupTaxpayerDto,
  SearchTaxpayerDto,
  ValidateDvDto,
  TaxpayerResponseDto,
  DvValidationResponseDto,
} from './dto';
import {
  ApiLookupTaxpayer,
  ApiValidateDv,
  ApiSearchTaxpayer,
} from './decorators/taxpayers-swagger.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../roles/enums/role.enum';

@ApiTags('Taxpayers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('taxpayers')
export class TaxpayersController {
  constructor(
    private readonly taxpayersService: TaxpayersService,
    private readonly directoryService: TaxpayersDirectoryService,
  ) {}

  @Get('lookup')
  @Roles(Role.ADMIN, Role.MANAGER, Role.USER)
  @ApiLookupTaxpayer()
  async lookup(@Query() dto: LookupTaxpayerDto): Promise<TaxpayerResponseDto> {
    return this.taxpayersService.lookup(dto);
  }

  @Get('validate-dv')
  @ApiValidateDv()
  // Any authenticated user can validate DV
  validateDv(@Query() dto: ValidateDvDto): DvValidationResponseDto {
    return this.taxpayersService.validateDv(dto.document, dto.country);
  }

  @Get('search')
  @Roles(Role.ADMIN, Role.MANAGER, Role.USER)
  @ApiSearchTaxpayer()
  async search(
    @Query() dto: SearchTaxpayerDto,
  ): Promise<TaxpayerResponseDto[]> {
    return this.directoryService.search(dto);
  }
}
