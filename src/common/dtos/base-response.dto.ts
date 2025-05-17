export class BaseResponseDto {
  isSuccess: boolean;
  message?: string;
  statusCode?: number;
  timestamp: string;
}
