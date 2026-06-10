import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Generated,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  @Generated('uuid')
  @Index({ unique: true })
  uuid: string;

  @Column('text', { comment: 'Token hasheado con bcrypt' })
  tokenHash: string;

  @Column('timestamp')
  @Index()
  expiresAt: Date;

  @Column('boolean', { default: false })
  isRevoked: boolean;

  @Column('varchar', {
    length: 255,
    nullable: true,
    comment: 'IP de origen del login',
  })
  ipAddress: string | null;

  @Column('text', { nullable: true, comment: 'User-Agent del cliente' })
  userAgent: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
