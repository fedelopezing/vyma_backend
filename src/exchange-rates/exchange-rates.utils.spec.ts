import { parsePrice, extractRelevantRates } from './exchange-rates.utils';

describe('ExchangeRatesUtils', () => {
  describe('parsePrice', () => {
    it('should parse a string containing numbers into an integer', () => {
      expect(parsePrice('7000')).toBe(7000);
      expect(parsePrice('1250.75')).toBe(1251);
    });

    it('should round numbers to the nearest integer', () => {
      expect(parsePrice(7500)).toBe(7500);
      expect(parsePrice(3.4)).toBe(3);
      expect(parsePrice('4.6')).toBe(5);
    });
  });

  describe('extractRelevantRates', () => {
    it('should extract and format relevant currencies only', () => {
      const items = [
        { isoCode: 'USD', purchasePrice: '7000', salePrice: 7100 },
        { isoCode: 'EUR', purchasePrice: '7800', salePrice: 7900 },
        { isoCode: 'BRL', purchasePrice: 1400, salePrice: '1450' },
        { isoCode: 'ARS', purchasePrice: 10, salePrice: 12 },
        { isoCode: 'CHF', purchasePrice: 6300, salePrice: 8200 },
        { isoCode: 'GBP', purchasePrice: 9000, salePrice: 9100 }, // Should be ignored
      ];

      const result = extractRelevantRates(items);

      expect(result).toHaveLength(5);
      expect(result).toEqual([
        { currency: 'USD', purchase: 7000, sale: 7100 },
        { currency: 'BRL', purchase: 1400, sale: 1450 },
        { currency: 'EUR', purchase: 7800, sale: 7900 },
        { currency: 'ARS', purchase: 10, sale: 12 },
        { currency: 'CHF', purchase: 6300, sale: 8200 },
      ]);
    });

    it('should ignore relevant currencies if they are not in the items array', () => {
      const items = [{ isoCode: 'USD', purchasePrice: 7000, salePrice: 7100 }];

      const result = extractRelevantRates(items);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        currency: 'USD',
        purchase: 7000,
        sale: 7100,
      });
    });
  });
});
