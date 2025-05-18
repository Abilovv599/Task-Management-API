import { Injectable } from '@nestjs/common';

import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { PaginatedList } from '~/common/models/paginated-list.model';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    page: number,
    limit: number,
  ): Promise<PaginatedList<T>> {
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedList(data, total, page, limit);
  }
}
