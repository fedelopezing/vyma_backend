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
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { Establishment } from './establishment.entity';

@Entity('staff_establishment_assignments')
@Index(['staffMemberId', 'establishmentId']) // Índice compuesto para queries de cobertura
export class StaffEstablishmentAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'bigint' })
  staffMemberId: number;

  @ManyToOne(() => StaffMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffMemberId' })
  staffMember: StaffMember;

  @Index()
  @Column({ type: 'uuid' })
  establishmentId: string;

  @ManyToOne(() => Establishment, (e) => e.staffAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'establishmentId' })
  establishment: Establishment;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null; // null = asignación vigente

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
