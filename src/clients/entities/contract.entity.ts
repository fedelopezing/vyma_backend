import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Establishment } from './establishment.entity';
import { ContractType, ContractStatus } from '../constants/clients-enums';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  establishmentId: string;

  @ManyToOne(() => Establishment, (e) => e.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'establishmentId' })
  establishment: Establishment;

  @Column({ type: 'enum', enum: ContractType })
  contractType: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.ACTIVO,
  })
  status: ContractStatus;

  // Términos Económicos — Abono Fijo (requerido en MVP)
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  monthlyAmount: number; // Monto mensual pactado

  @Column({ type: 'varchar', length: 3, default: 'PYG' })
  currency: string;

  // Bolsa de Horas (opcional — solo si contractType = BOLSA_HORAS)
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  hoursBundleTotal: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number | null;

  // Vigencia
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null; // null = contrato indefinido

  // Condiciones adicionales
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
