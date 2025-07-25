import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { User } from '../../auth/entities/user.entity';
import { Profession } from '../../professions/entities/profession.entity';
import { Schedule } from "../../schedules/entities/schedule.entity";

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column('varchar', { length: 50, nullable: true })
  document: string | null;

  @Column('enum', {
    enum: ['RUC','CI','PASSPORT','OTHER'],
    default: 'CI',
  })
  documentType: 'RUC' | 'CI' | 'PASSPORT' | 'OTHER';

  @Column('text', { nullable: true })
  bio: string | null;

  @Column('varchar', { length: 20, nullable: true })
  phone: string | null;

  @Column('varchar', { length: 200, nullable: true })
  address: string | null;

  @Column('varchar', { length: 50, nullable: true })
  city: string | null;

  @Column('enum', {
    enum: ['none', 'male', 'female'],
    default: 'none',
  })
  gender: 'none' | 'male' | 'female';

  @Column({ nullable: true, name: 'birth_date' })
  birthDate: Date;

  @Column('text', { nullable: true })
  avatarUrl: string | null;

  @ManyToOne(() => Profession, { nullable: true, eager: true })
  @JoinColumn({ name: 'profession_id' })
  profession: Profession | null;

  @OneToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Schedule, (schedule) => schedule.profile)
  schedules: Schedule[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
