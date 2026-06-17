export interface CambiosChacoItem {
  isoCode: string;
  purchasePrice: number | string;
  salePrice: number | string;
}

export interface ScrapedRate {
  currency: string;
  purchase: number;
  sale: number;
}

export function parsePrice(price: number | string): number {
  return Math.round(Number(price));
}

export function extractRelevantRates(items: CambiosChacoItem[]): ScrapedRate[] {
  const relevantCurrencies = ['USD', 'BRL', 'EUR', 'ARS', 'CHF'];
  const result: ScrapedRate[] = [];

  for (const currency of relevantCurrencies) {
    const item = items.find((i) => i.isoCode === currency);
    if (item) {
      result.push({
        currency,
        purchase: parsePrice(item.purchasePrice),
        sale: parsePrice(item.salePrice),
      });
    }
  }

  return result;
}
