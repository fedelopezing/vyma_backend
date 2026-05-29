import { NewsStatus } from '../entities/news.entity';

export const NEWS_PUBLISHED_EVENT = 'news.published';

export class NewsPublishedEvent {
  constructor(
    public readonly id: string,
    public readonly slugEs: string,
    public readonly slugEn: string | null,
    public readonly estado: NewsStatus,
  ) {}
}
