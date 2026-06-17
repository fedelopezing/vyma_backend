import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Company } from '../../companies/entities/company.entity';

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

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

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
