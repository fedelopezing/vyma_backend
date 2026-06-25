import {
  EventOrganizer,
  EventStatus,
} from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

const PORTADA_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

export interface EventSeedItem {
  slugEs: string;
  slugEn: string;
  tituloEs: string;
  tituloEn: string;
  resumenEs: string;
  resumenEn: string;
  contenidoEs: string;
  contenidoEn: string;
  imagenPortada: string;
  fechaEvento: Date;
  ubicacionEs: string;
  ubicacionEn: string;
  linkRegistro: string;
  organizador: EventOrganizer;
  organizadorNombre: string | null;
  estado: EventStatus;
  autor: User;
}

export const buildEventsSeedData = (author: User): EventSeedItem[] => [
  {
    slugEs: 'cena-de-networking-ccps-2026',
    slugEn: 'ccps-networking-dinner-2026',
    tituloEs: 'Cena de Networking CCPS 2026',
    tituloEn: 'CCPS Networking Dinner 2026',
    resumenEs: 'Una noche de conexiones y networking estratégico.',
    resumenEn: 'A night of connections and strategic networking.',
    contenidoEs: '<p>Acompáñanos en la gran cena anual de networking...</p>',
    contenidoEn: '<p>Join us at the grand annual networking dinner...</p>',
    imagenPortada: PORTADA_URL,
    fechaEvento: new Date('2026-10-15T19:30:00Z'),
    ubicacionEs: 'Hotel Sheraton, Asunción',
    ubicacionEn: 'Sheraton Hotel, Asuncion',
    linkRegistro: 'https://eventbrite.com/e/networking-2026',
    organizador: EventOrganizer.CCPS,
    organizadorNombre: null,
    estado: EventStatus.PUBLICADO,
    autor: author,
  },
  {
    slugEs: 'conferencia-de-innovacion-tecnologica',
    slugEn: 'tech-innovation-conference',
    tituloEs: 'Conferencia de Innovación Tecnológica',
    tituloEn: 'Tech Innovation Conference',
    resumenEs: 'Las tendencias tecnológicas que definirán el futuro.',
    resumenEn: 'The technology trends that will define the future.',
    contenidoEs:
      '<p>Charlas sobre Inteligencia Artificial, Cloud, y más...</p>',
    contenidoEn:
      '<p>Talks about Artificial Intelligence, Cloud, and more...</p>',
    imagenPortada: PORTADA_URL,
    fechaEvento: new Date('2026-11-20T09:00:00Z'),
    ubicacionEs: 'Centro de Convenciones CONMEBOL, Luque',
    ubicacionEn: 'CONMEBOL Convention Center, Luque',
    linkRegistro: 'https://eventbrite.com/e/tech-conf-2026',
    organizador: EventOrganizer.SOCIO,
    organizadorNombre: 'Tecnología Avanzada S.A.',
    estado: EventStatus.PUBLICADO,
    autor: author,
  },
  {
    slugEs: 'taller-de-marketing-digital',
    slugEn: 'digital-marketing-workshop',
    tituloEs: 'Taller Práctico de Marketing Digital',
    tituloEn: 'Practical Digital Marketing Workshop',
    resumenEs: 'Estrategias accionables para potenciar tu marca.',
    resumenEn: 'Actionable strategies to boost your brand.',
    contenidoEs: '<p>Aprende SEO, campañas pagadas y redes sociales...</p>',
    contenidoEn: '<p>Learn SEO, paid campaigns, and social media...</p>',
    imagenPortada: PORTADA_URL,
    fechaEvento: new Date('2026-12-05T14:00:00Z'),
    ubicacionEs: 'Oficinas CCPS, Asunción',
    ubicacionEn: 'CCPS Offices, Asuncion',
    linkRegistro: 'https://eventbrite.com/e/mkt-workshop',
    organizador: EventOrganizer.CCPS,
    organizadorNombre: null,
    estado: EventStatus.PUBLICADO,
    autor: author,
  },
  {
    slugEs: 'reunion-de-comite-de-socios',
    slugEn: 'members-committee-meeting',
    tituloEs: 'Reunión de Comité de Socios (Borrador)',
    tituloEn: 'Members Committee Meeting (Draft)',
    resumenEs: 'Sesión ordinaria de planificación del comité.',
    resumenEn: 'Ordinary planning session of the committee.',
    contenidoEs: '<p>Revisión de temas de agenda interna de la cámara.</p>',
    contenidoEn: '<p>Review of internal chamber agenda topics.</p>',
    imagenPortada: PORTADA_URL,
    fechaEvento: new Date('2026-08-30T10:00:00Z'),
    ubicacionEs: 'Sala de Reuniones A, CCPS',
    ubicacionEn: 'Meeting Room A, CCPS',
    linkRegistro: 'https://eventbrite.com/e/committee-meeting',
    organizador: EventOrganizer.CCPS,
    organizadorNombre: null,
    estado: EventStatus.BORRADOR,
    autor: author,
  },
];
