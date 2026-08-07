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
import { Company } from '../../companies/entities/company.entity';
import {
  ClientType,
  TaxCondition,
  BusinessForm,
} from '../constants/clients-enums';
import { ClientRepresentative } from './client-representative.entity';
import { Establishment } from './establishment.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tenant dueño del registro
  @Index()
  @Column({ type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Datos Fiscales
  @Column({ type: 'enum', enum: ClientType })
  clientType: ClientType;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  ruc: string; // RUC Paraguay (con dígito verificador)
  // UNIQUE INDEX compuesto: (companyId, ruc) definido en migración

  @Column({ type: 'varchar', length: 200 })
  businessName: string; // Razón Social / Nombre del Propietario

  @Column({ type: 'varchar', length: 200, nullable: true })
  fantasyName: string | null; // Nombre de Fantasía

  @Column({ type: 'enum', enum: TaxCondition, default: TaxCondition.IVA_10 })
  taxCondition: TaxCondition;

  @Column({ type: 'enum', enum: BusinessForm, nullable: true })
  businessForm: BusinessForm | null;

  // Solo Persona Física (nullable — obligatorio en DTO si clientType = PERSONA_FISICA)
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  // Contacto
  @Column({ type: 'varchar', length: 150, nullable: true })
  emailPrimary: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  emailSecondary: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  // Domicilio Fiscal
  @Column({ type: 'varchar', length: 100, nullable: true })
  fiscalDepartment: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fiscalDistrict: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fiscalLocality: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fiscalNeighborhood: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fiscalAddress: string | null;

  // Relaciones
  @OneToMany(() => ClientRepresentative, (r) => r.client, { cascade: true })
  representatives: ClientRepresentative[];

  @OneToMany(() => Establishment, (e) => e.client, { cascade: true })
  establishments: Establishment[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
