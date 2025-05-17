import { BaseResponseDto } from '~/common/dtos/base-response.dto';

export class ResultResponseDto<T> extends BaseResponseDto {
  data!: T | null;
}
