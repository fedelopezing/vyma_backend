import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Profile } from '../../profiles/entities/profile.entity';
import { ScheduleBreak } from '../../schedule-breaks/entities/schedule-break.entity';

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
}
