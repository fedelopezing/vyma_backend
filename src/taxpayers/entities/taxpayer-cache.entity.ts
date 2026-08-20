import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('taxpayer_cache')
@Unique(['countryCode', 'ruc'])
export class TaxpayerCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 2, default: 'PY' })
  countryCode: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  documentNumber: string;

  @Column({ type: 'varchar', length: 2 })
  dv: string;

  @Column({ type: 'varchar', length: 25 })
  ruc: string;

  // El índice Trigram para búsquedas Full-Text se creará vía Migración manual
  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 30 })
  taxpayerType: string;

  @Column({ type: 'varchar', length: 30, default: 'ACTIVO' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Index()
  @Column({ type: 'timestamptz' })
  cacheExpiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  rawData: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
