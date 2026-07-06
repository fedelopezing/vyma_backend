import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExchangeRatesService } from './exchange-rates.service';
import {
  ApiGetExchangeRates,
  ApiManualScrape,
} from './decorators/exchange-rates-swagger.decorators';
import { ExchangeRatesResponseDto, ManualScrapeResponseDto } from './dto';
import { AuthPermissions } from '../auth/decorators/auth-permissions.decorator';
import { TenantGuard } from '../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../common/guards/module-access.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { ActiveCompanyId } from '../common/decorators/active-company-id.decorator';
import { CompanyModule } from '../common/constants/modules.enum';
import { CompaniesRepository } from '../companies/repositories/companies.repository';
import { resolveActiveCompany } from '../common/helpers/company-resolver.helper';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  @Get()
  @ApiGetExchangeRates()
  async getRates(
    @Query('companyUuid') companyUuid: string,
  ): Promise<ExchangeRatesResponseDto> {
    const company = await resolveActiveCompany(
      companyUuid,
      this.companiesRepository,
    );
    const rates = await this.exchangeRatesService.getLatestRates(company.id);
    return {
      rates: rates.map((rate) => ({
        currency: rate.currency,
        purchasePrice: rate.purchasePrice,
        salePrice: rate.salePrice,
        isFallback: rate.isFallback,
        updatedAt: rate.updatedAt,
      })),
    };
  }

  @Post('scrape')
  @AuthPermissions('exchange_rates:manage')
  @UseGuards(AuthGuard('jwt'), TenantGuard, ModuleAccessGuard)
  @RequireModule(CompanyModule.EXCHANGE_RATES)
  @ApiManualScrape()
  async manualScrape(
    @ActiveCompanyId() companyId: number,
  ): Promise<ManualScrapeResponseDto> {
    await this.exchangeRatesService.scrapeAndSaveRates(companyId);
    return { message: 'Scraping manual de cotizaciones completado' };
  }
}
