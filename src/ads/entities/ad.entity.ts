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
import { Company } from '../../companies/entities/company.entity';

@Entity('ads')
@Index('IDX_ads_active_carousel', [
  'companyId',
  'isActive',
  'order',
  'createdAt',
])
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** URL de la imagen del banner en español (Cloudinary) */
  @Column('varchar', {
    length: 500,
    name: 'image_url_es',
    comment: 'Cloudinary URL for Spanish banner',
  })
  imageUrlEs: string;

  /** URL de la imagen del banner en inglés (Cloudinary) — opcional */
  @Column('varchar', {
    length: 500,
    name: 'image_url_en',
    nullable: true,
    comment: 'Cloudinary URL for English banner',
  })
  imageUrlEn: string | null;

  /** URL de redirección externa para el banner en español */
  @Column('varchar', { length: 500, name: 'link_url_es', nullable: true })
  linkUrlEs: string | null;

  /** URL de redirección externa para el banner en inglés */
  @Column('varchar', { length: 500, name: 'link_url_en', nullable: true })
  linkUrlEn: string | null;

  /** Texto alternativo para accesibilidad (a11y) en español */
  @Column('varchar', { length: 255, name: 'alt_es', nullable: true })
  altEs: string | null;

  /** Texto alternativo para accesibilidad (a11y) en inglés */
  @Column('varchar', { length: 255, name: 'alt_en', nullable: true })
  altEn: string | null;

  /** Indica si el banner está activo y visible en el carrusel */
  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  /** Orden de prioridad en el carrusel (ascendente) */
  @Column('integer', { default: 0 })
  order: number;

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
