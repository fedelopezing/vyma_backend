import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('schedule_breaks')
export class ScheduleBreak {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.breaks, {
    onDelete: 'CASCADE',
  })
  schedule: Schedule;

  @Column({ type: 'time' })
  breakStart: string;

  @Column({ type: 'time' })
  breakEnd: string;

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
