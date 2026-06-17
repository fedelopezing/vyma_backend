import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { ScheduleBreak } from '../../schedule-breaks/entities/schedule-break.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Profile, (profile) => profile.schedules, {
    onDelete: 'CASCADE',
  })
  profile: Profile;

  @Column({
    type: 'enum',
    enum: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
  })
  dayOfWeek: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ScheduleBreak, (scheduleBreak) => scheduleBreak.schedule)
  breaks: ScheduleBreak[];

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
