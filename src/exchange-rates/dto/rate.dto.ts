import { ApiProperty } from '@nestjs/swagger';

export class RateDto {
  @ApiProperty({ example: 'USD', description: 'Código ISO de la moneda' })
  currency: string;

  @ApiProperty({ example: 7000, description: 'Precio de compra en guaraníes' })
  purchasePrice: number;

  @ApiProperty({ example: 7100, description: 'Precio de venta en guaraníes' })
  salePrice: number;

  @ApiProperty({
    example: false,
    description:
      'Indica si es un valor de respaldo (fallback) por falla en scraping',
  })
  isFallback: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}
