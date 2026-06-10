import { NewsCategory, NewsStatus } from '../../news/entities/news.entity';
import { User } from '../../users/entities/user.entity';

const PORTADA_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

export interface NewsSeedItem {
  slugEs: string;
  slugEn: string;
  tituloEs: string;
  tituloEn: string;
  resumenEs: string;
  resumenEn: string;
  contenidoEs: string;
  contenidoEn: string;
  imagenPortada: string;
  categoria: NewsCategory;
  estado: NewsStatus;
  autor: User;
}

export const buildNewsSeedData = (author: User): NewsSeedItem[] => [
  {
    slugEs: 'bienvenidos-a-vyma',
    slugEn: 'welcome-to-vyma',
    tituloEs: 'Bienvenidos a VYMA',
    tituloEn: 'Welcome to VYMA',
    resumenEs: 'Lanzamiento de nuestra nueva plataforma',
    resumenEn: 'Launch of our new platform',
    contenidoEs:
      '<p>Estamos emocionados de lanzar nuestra nueva plataforma.</p>',
    contenidoEn: '<p>We are excited to launch our new platform.</p>',
    imagenPortada: PORTADA_URL,
    categoria: NewsCategory.NOTICIA,
    estado: NewsStatus.PUBLICADO,
    autor: author,
  },
  {
    slugEs: 'nuevos-servicios-disponibles',
    slugEn: 'new-services-available',
    tituloEs: 'Nuevos Servicios Disponibles',
    tituloEn: 'New Services Available',
    resumenEs: 'Nuevos servicios para tu experiencia',
    resumenEn: 'New services for your experience',
    contenidoEs:
      '<p>Hemos añadido nuevos servicios para mejorar tu experiencia.</p>',
    contenidoEn:
      '<p>We have added new services to improve your experience.</p>',
    imagenPortada: PORTADA_URL,
    categoria: NewsCategory.COMUNICADO,
    estado: NewsStatus.PUBLICADO,
    autor: author,
  },
  {
    slugEs: 'actualizacion-de-horarios',
    slugEn: 'schedule-update',
    tituloEs: 'Actualización de Horarios',
    tituloEn: 'Schedule Update',
    resumenEs: 'Más disponibilidad para turnos',
    resumenEn: 'More availability for appointments',
    contenidoEs:
      '<p>Nuestros profesionales ahora tienen más disponibilidad.</p>',
    contenidoEn: '<p>Our professionals now have more availability.</p>',
    imagenPortada: PORTADA_URL,
    categoria: NewsCategory.NOTICIA,
    estado: NewsStatus.PUBLICADO,
    autor: author,
  },
  {
    slugEs: 'mantenimiento-programado',
    slugEn: 'scheduled-maintenance',
    tituloEs: 'Mantenimiento Programado',
    tituloEn: 'Scheduled Maintenance',
    resumenEs: 'Mantenimiento de fin de semana',
    resumenEn: 'Weekend maintenance',
    contenidoEs:
      '<p>La plataforma estará en mantenimiento este fin de semana.</p>',
    contenidoEn: '<p>The platform will undergo maintenance this weekend.</p>',
    imagenPortada: PORTADA_URL,
    categoria: NewsCategory.COMUNICADO,
    estado: NewsStatus.BORRADOR,
    autor: author,
  },
  {
    slugEs: 'nuevas-funcionalidades',
    slugEn: 'new-features',
    tituloEs: 'Nuevas Funcionalidades',
    tituloEn: 'New Features',
    resumenEs: 'Sistema de notificaciones',
    resumenEn: 'Notifications system',
    contenidoEs:
      '<p>Hemos implementado un sistema de notificaciones mejorado.</p>',
    contenidoEn: '<p>We have implemented an improved notification system.</p>',
    imagenPortada: PORTADA_URL,
    categoria: NewsCategory.NOTICIA,
    estado: NewsStatus.PUBLICADO,
    autor: author,
  },
];
