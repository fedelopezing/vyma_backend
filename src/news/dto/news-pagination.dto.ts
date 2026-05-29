import { NewsCategory, NewsStatus } from '../entities/news.entity';

export class NewsPaginationDto {
  page?: number;
  limit?: number;
  categoria?: NewsCategory;
  estado?: NewsStatus;
}
