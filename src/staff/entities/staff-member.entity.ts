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
import { User } from '../../users/entities/user.entity';
import {
  StaffStatus,
  ContractType,
  PaymentType,
  Gender,
} from '../constants/staff-enums';

@Entity('staff_members')
export class StaffMember {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid', generated: 'uuid' })
  uuid: string;

  // Relación obligatoria con la Empresa Multi-tenant
  @Index()
  @Column({ type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Relación OPCIONAL con Usuario del sistema (preparado para futura App de Marcación)
  @Index()
  @Column({ type: 'bigint', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  // Datos Personales
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  nationalId: string; // Cédula de Identidad Paraguay

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  // Datos Laborales
  @Column({ type: 'varchar', length: 100, default: 'Personal de Limpieza' })
  position: string;

  @Column({ type: 'enum', enum: ContractType, default: ContractType.FULL_TIME })
  contractType: ContractType;

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date | null;

  // @deprecated Use staff_establishment_assignments table instead
  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'DEPRECATED: use staff_establishment_assignments' })
  assignedLocation: string | null; // Sucursal / Cliente de limpieza asignado

  // Parámetros Salariales y Bancarios
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.0 })
  baseSalary: number;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.MONTHLY })
  paymentType: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number | null;

  @Column({ type: 'boolean', default: true })
  hasIpsCoverage: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccountNumber: string | null;

  // Documentos adjuntos (URLs de Cloudinary via MediaModule)
  @Column({ type: 'jsonb', nullable: true })
  documentUrls: Array<{ title: string; url: string; category: string }> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
