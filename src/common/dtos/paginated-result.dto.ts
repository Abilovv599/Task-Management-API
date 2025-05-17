import { ResultResponseDto } from '~/common/dtos/result-response.dto';

interface IPaginatedResultResponseMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedResultResponseDto<T> extends ResultResponseDto<T> {
  meta!: IPaginatedResultResponseMeta;
}
