import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from './company.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('user_companies')
@Index(['userId', 'companyId'], { unique: true })
export class UserCompany {
  @Index()
  @PrimaryColumn({ name: 'userId', type: 'bigint' })
  userId: number;

  @Index()
  @PrimaryColumn({ name: 'companyId', type: 'bigint' })
  companyId: number;

  @Column({ name: 'roleId', type: 'bigint' })
  roleId: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Company, (company) => company.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
