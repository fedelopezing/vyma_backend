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
import { Client } from './client.entity';
import { RepresentativeRole, DocumentType } from '../constants/clients-enums';

@Entity('client_representatives')
export class ClientRepresentative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, (c) => c.representatives, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  // Identificación (requerida por formulario VUE)
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.CEDULA_PY })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 30 })
  documentNumber: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  nationality: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  maritalStatus: string | null;

  // Perfil Profesional
  @Column({ type: 'enum', enum: RepresentativeRole })
  role: RepresentativeRole;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profession: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  professionalRegistrationNumber: string | null;

  // Vigencia del Cargo
  @Column({ type: 'date', nullable: true })
  roleStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  roleEndDate: Date | null; // Para alertas de renovación en Fase 2

  // Solo si role = SOCIO
  @Column({ type: 'integer', nullable: true })
  sharesCount: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  shareValue: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  totalSharesValue: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
