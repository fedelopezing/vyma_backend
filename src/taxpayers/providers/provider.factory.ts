import { Injectable, Logger } from '@nestjs/common';
import { ITaxpayerProvider } from '../interfaces/i-taxpayer-provider.interface';
import { PyDnitPublicProvider } from './py-dnit-public.provider';

@Injectable()
export class TaxpayerProviderFactory {
  private readonly logger = new Logger(TaxpayerProviderFactory.name);

  constructor(private readonly pyDnitProvider: PyDnitPublicProvider) {}

  getProvider(countryCode: string): ITaxpayerProvider {
    switch (countryCode.toUpperCase()) {
      case 'PY':
        return this.pyDnitProvider;
      default:
        this.logger.error(`No provider found for country: ${countryCode}`);
        throw new Error(`Provider for country ${countryCode} not found`);
    }
  }
}
