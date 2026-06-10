import { PaginatedResponse } from '../interfaces';

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
