import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('activation_tokens')
export class ActivationToken {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column('text', { comment: 'Token de activación hasheado con bcrypt' })
  tokenHash: string;

  @Column('timestamp')
  @Index()
  expiresAt: Date;

  @Column('boolean', { default: false })
  isUsed: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
