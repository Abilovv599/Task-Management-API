import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function setupMockQueryBuilder<T extends ObjectLiteral>(
  data: T[],
  total: number,
): jest.Mocked<SelectQueryBuilder<T>> {
  return {
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([data, total]),
  } as unknown as jest.Mocked<SelectQueryBuilder<T>>;
}
