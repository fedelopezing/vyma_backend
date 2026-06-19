import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum MemberStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

export enum FeeType {
  ANNUAL = 'ANNUAL',
  SEMIANNUAL = 'SEMIANNUAL',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'bigint' })
  @Index()
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column({ name: 'fee_type', type: 'enum', enum: FeeType })
  feeType: FeeType;

  @Column('varchar', { name: 'company_name', length: 255 })
  @Index()
  companyName: string;

  @Column('varchar', { name: 'tax_id', length: 50 })
  taxId: string;

  @Column('varchar', { length: 255 })
  address: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('varchar', { length: 50 })
  phone: string;

  @Column('varchar', { length: 100 })
  @Index()
  category: string;

  @Column('varchar', { name: 'representative_name', length: 255 })
  representativeName: string;

  @Column('varchar', { name: 'representative_email', length: 255 })
  representativeEmail: string;

  @Column('varchar', { name: 'representative_phone', length: 50 })
  representativePhone: string;

  @Column('jsonb', { name: 'social_links', nullable: true })
  socialLinks: Record<string, string>;

  @Column('jsonb', { name: 'marketing_contact', nullable: true })
  marketingContact: { name: string; email: string; phone?: string };

  @Column('text', { name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column('boolean', { name: 'is_featured', default: false })
  @Index()
  isFeatured: boolean;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING })
  @Index()
  status: MemberStatus;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
