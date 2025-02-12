import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column('varchar', { length: 255, nullable: false })
  name: string;

  @Column('varchar', { length: 100, unique: true, nullable: false })
  email: string;

  @Column('varchar', { length: 255, select: false, nullable: false })
  passwordHash: string;

  @Column('enum', {
    enum: ['local', 'google', 'facebook', 'twitter', 'github', 'linkedin'],
    default: 'local',
    comment: 'Proveedor de autenticación',
  })
  provider: 'local' | 'google' | 'facebook' | 'twitter' | 'github' | 'linkedin';

  @Column('varchar', {
    length: 255,
    nullable: true,
    comment: 'ID único del usuario en el proveedor de redes sociales',
  })
  providerId: string | null;

  @Column('text', {
    nullable: true,
    comment:
      'Token de acceso del proveedor (si necesitas interactuar con su API)',
  })
  accessToken: string | null;

  @Column('text', {
    nullable: true,
    comment: 'Token de actualización (si aplica para la API del proveedor)',
  })
  refreshToken: string | null;

  @Column('timestamp', {
    nullable: true,
    comment: 'Fecha de expiración del token de acceso (opcional)',
  })
  tokenExpiry: Date | null;

  @Column('enum', {
    enum: ['client', 'professional', 'admin'],
    default: 'client',
  })
  role: 'client' | 'professional' | 'admin';

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.name = this.name.toUpperCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
