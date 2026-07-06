import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

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

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
