export enum TaxpayerEvents {
  STATUS_CHANGED = 'taxpayer.status_changed',
}

export interface TaxpayerStatusChangedEvent {
  countryCode: string;
  ruc: string;
  oldStatus: string;
  newStatus: string;
  detectedAt: Date;
}
