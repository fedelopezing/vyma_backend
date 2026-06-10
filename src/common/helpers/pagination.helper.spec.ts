import { buildPaginatedResponse } from './pagination.helper';

describe('pagination.helper', () => {
  describe('buildPaginatedResponse', () => {
    it('should calculate metadata correctly with default parameters', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const total = 15;

      const result = buildPaginatedResponse(data, total);

      expect(result).toEqual({
        data,
        meta: {
          page: 1,
          limit: 10,
          total: 15,
          totalPages: 2,
          hasNextPage: true,
          hasPrevPage: false,
        },
      });
    });

    it('should calculate metadata correctly with custom parameters on page 2', () => {
      const data = [{ id: 3 }];
      const total = 15;

      const result = buildPaginatedResponse(data, total, 2, 2);

      expect(result).toEqual({
        data,
        meta: {
          page: 2,
          limit: 2,
          total: 15,
          totalPages: 8,
          hasNextPage: true,
          hasPrevPage: true,
        },
      });
    });

    it('should calculate metadata correctly on the last page', () => {
      const data = [{ id: 3 }];
      const total = 5;

      const result = buildPaginatedResponse(data, total, 2, 4);

      expect(result).toEqual({
        data,
        meta: {
          page: 2,
          limit: 4,
          total: 5,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true,
        },
      });
    });
  });
});
