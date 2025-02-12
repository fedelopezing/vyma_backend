import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Schedule } from "../../schedules/entities/schedule.entity";

@Entity('schedule_breaks')
export class ScheduleBreak {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.breaks, { onDelete: 'CASCADE' })
  schedule: Schedule;

  @Column({ type: 'time' })
  breakStart: string;

  @Column({ type: 'time' })
  breakEnd: string;
}
