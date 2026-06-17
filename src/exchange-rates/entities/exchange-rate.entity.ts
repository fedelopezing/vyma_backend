import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 10 })
  currency: string; // 'USD', 'CHF', 'EUR', 'BRL', 'ARS'

  @Column({ type: 'integer' })
  purchasePrice: number; // Compra (entero redondeado)

  @Column({ type: 'integer' })
  salePrice: number; // Venta (entero redondeado)

  @Column({ type: 'boolean', default: false })
  isFallback: boolean; // Indica si se está sirviendo como contingencia

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
