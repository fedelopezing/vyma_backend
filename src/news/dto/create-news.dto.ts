import { NewsCategory, NewsStatus } from '../entities/news.entity';

export class CreateNewsDto {
  tituloEs: string;
  tituloEn?: string;
  resumenEs: string;
  resumenEn?: string;
  contenidoEs: string;
  contenidoEn?: string;
  imagenPortada: string;
  categoria?: NewsCategory;
  estado?: NewsStatus;
}
