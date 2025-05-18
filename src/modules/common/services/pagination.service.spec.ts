import { Test, TestingModule } from '@nestjs/testing';

import { SelectQueryBuilder } from 'typeorm';

import { assertPaginatedResult } from '~/test/utils/assertion';
import { setupMockQueryBuilder } from '~/test/utils/mock-query-builder';

import { PaginationService } from './pagination.service';

describe('PaginationService', () => {
  let paginationService: PaginationService;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationService],
    }).compile();

    paginationService = module.get<PaginationService>(PaginationService);
  });

  describe('paginate', () => {
    it('should return a PaginatedList with the correct data', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      const mockTotal = 10;
      const page = 2;
      const limit = 5;

      mockQueryBuilder = setupMockQueryBuilder(mockData, mockTotal);

      const result = await paginationService.paginate(mockQueryBuilder, page, limit);

      assertPaginatedResult(result, mockQueryBuilder, mockData, mockTotal, page, limit);
    });

    it('should handle empty results', async () => {
      const mockData: any[] = [];
      const mockTotal = 0;
      const page = 1;
      const limit = 10;

      mockQueryBuilder = setupMockQueryBuilder(mockData, mockTotal);

      const result = await paginationService.paginate(mockQueryBuilder, page, limit);

      assertPaginatedResult(result, mockQueryBuilder, mockData, mockTotal, page, limit);
    });
  });
});
