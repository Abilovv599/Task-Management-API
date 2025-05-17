import { BaseResponseDto } from '~/common/dtos/base-response.dto';

export class ErrorResponseDto extends BaseResponseDto {
  path: string;
  error: {
    errors: string[];
  };
}
