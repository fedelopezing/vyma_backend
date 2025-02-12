import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('professions')
export class Profession {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, select: false })
  deletedAt?: Date;

  @OneToMany(() => Profile, (profile) => profile.profession)
  profiles: Profile[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.name = this.name.toUpperCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
