import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NewsCategory {
  NOTICIA = 'NOTICIA',
  COMUNICADO = 'COMUNICADO',
  EVENTO_SOCIO = 'EVENTO_SOCIO',
}

export enum NewsStatus {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
}

@Entity('news')
@Index('IDX_news_filter', ['estado', 'categoria', 'deletedAt'])
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_news_slug_es', { unique: true })
  @Column('varchar', { length: 255, unique: true })
  slugEs: string;

  @Index('IDX_news_slug_en', { unique: true })
  @Column('varchar', { length: 255, unique: true, nullable: true })
  slugEn: string | null;

  @Column('varchar', { length: 255 })
  tituloEs: string;

  @Column('varchar', { length: 255, nullable: true })
  tituloEn: string | null;

  @Column('text')
  resumenEs: string;

  @Column('text', { nullable: true })
  resumenEn: string | null;

  @Column('text', { comment: 'Almacena HTML enriquecido sanitizado' })
  contenidoEs: string;

  @Column('text', {
    nullable: true,
    comment: 'Almacena HTML enriquecido sanitizado bilingüe',
  })
  contenidoEn: string | null;

  @Column('varchar', { length: 500, comment: 'Cloudinary URL' })
  imagenPortada: string;

  @Column({
    type: 'enum',
    enum: NewsCategory,
    default: NewsCategory.NOTICIA,
  })
  categoria: NewsCategory;

  @Column({
    type: 'enum',
    enum: NewsStatus,
    default: NewsStatus.BORRADOR,
  })
  estado: NewsStatus;

  @Column('bigint', { name: 'autor_id' })
  autorId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'autor_id' })
  autor: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
