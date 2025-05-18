import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { PaginatedList } from '~/common/models/paginated-list.model';

export function assertPaginatedResult<T extends ObjectLiteral>(
  result: PaginatedList<T>,
  queryBuilder: jest.Mocked<SelectQueryBuilder<T>>,
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  expect(queryBuilder.skip).toHaveBeenCalledWith((page - 1) * limit);
  expect(queryBuilder.take).toHaveBeenCalledWith(limit);
  expect(queryBuilder.getManyAndCount).toHaveBeenCalled();

  expect(result).toBeInstanceOf(PaginatedList);
  expect(result.list).toEqual(data);
  expect(result.meta.total).toEqual(total);
  expect(result.meta.page).toEqual(page);
  expect(result.meta.limit).toEqual(limit);
  expect(result.meta.lastPage).toEqual(Math.ceil(total / limit));
  expect(result.meta.hasNextPage).toEqual(page < Math.ceil(total / limit));
  expect(result.meta.hasPreviousPage).toEqual(page > 1);
}
