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
  OneToMany,
} from 'typeorm';
import { Client } from './client.entity';
import { Contract } from './contract.entity';
import { StaffEstablishmentAssignment } from './staff-establishment-assignment.entity';

@Entity('establishments')
export class Establishment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, (c) => c.establishments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  // Datos del Establecimiento
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isHeadquarters: boolean;

  // Datos VUE/RIEL (opcionales Fase 1)
  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralAccount: string | null; // Cuenta Corriente Catastral

  @Column({ type: 'varchar', length: 30, nullable: true })
  padronNumber: string | null; // Nro. de Padrón

  @Column({ type: 'varchar', length: 30, nullable: true })
  estateFincaNumber: string | null; // Nro. de Finca

  // Contacto de la Sede
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationReference: string | null;

  // Geocerca (opcional en Fase 1 — nullable)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'integer', nullable: true })
  geofenceRadiusMeters: number | null; // Radio de tolerancia configurable

  // Metadatos Operativos (estructura preparada — lógica activa en Fase 2)
  @Column({ type: 'jsonb', nullable: true })
  accessSchedules: Array<{ day: string; from: string; to: string }> | null;

  @Column({ type: 'jsonb', nullable: true })
  requiredPpe: string[] | null; // Listado EPP requerido

  // Relaciones
  @OneToMany(() => Contract, (c) => c.establishment, { cascade: true })
  contracts: Contract[];

  @OneToMany(() => StaffEstablishmentAssignment, (a) => a.establishment)
  staffAssignments: StaffEstablishmentAssignment[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
