interface IPaginatedResultMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedList<T> {
  list: T[];
  meta: IPaginatedResultMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.list = data;

    const lastPage = Math.ceil(total / limit);

    this.meta = {
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPreviousPage: page > 1,
    };
  }
}
