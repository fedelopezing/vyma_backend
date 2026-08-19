import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from 'typeorm';

@Entity('taxpayer_directory')
@Unique(['countryCode', 'ruc'])
export class TaxpayerDirectory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 2, default: 'PY' })
  countryCode: string;

  @Column({ type: 'varchar', length: 25 })
  ruc: string;

  // Índice GIN (trgm) se agrega en la migración generada
  @Column({ type: 'varchar', length: 255 })
  businessName: string;
}
