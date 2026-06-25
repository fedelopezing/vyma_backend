import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

export enum EventOrganizer {
  CCPS = 'CCPS',
  SOCIO = 'SOCIO',
}

export enum EventStatus {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
}

@Entity('events')
@Index('IDX_events_agenda', ['estado', 'fechaEvento', 'deletedAt'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_events_slug_es', { unique: true })
  @Column('varchar', { length: 255, unique: true })
  slugEs: string;

  @Index('IDX_events_slug_en', { unique: true })
  @Column('varchar', { length: 255, unique: true, nullable: true })
  slugEn: string | null;

  @Column('varchar', { length: 255 })
  tituloEs: string;

  @Column('varchar', { length: 255, nullable: true })
  tituloEn: string | null;

  @Column('text')
  resumenEs: string;

  @Column('text', { nullable: true })
  resumenEn: string | null;

  @Column('text', { comment: 'HTML enriquecido sanitizado ES' })
  contenidoEs: string;

  @Column('text', { nullable: true, comment: 'HTML enriquecido sanitizado EN' })
  contenidoEn: string | null;

  @Column('varchar', { length: 500, comment: 'Cloudinary URL' })
  imagenPortada: string;

  @Column({ type: 'timestamptz' })
  fechaEvento: Date;

  @Column('varchar', { length: 500, nullable: true })
  ubicacionEs: string | null;

  @Column('varchar', { length: 500, nullable: true })
  ubicacionEn: string | null;

  @Column('varchar', { length: 500, nullable: true })
  linkRegistro: string | null;

  @Column({ type: 'enum', enum: EventOrganizer })
  organizador: EventOrganizer;

  @Column('varchar', { length: 255, nullable: true })
  organizadorNombre: string | null;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.BORRADOR })
  estado: EventStatus;

  @Index()
  @Column('bigint', { name: 'autor_id' })
  autorId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'autor_id' })
  autor: User;

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
