export interface IBaseResponseModel {
  isSuccess: boolean;
  message?: string;
  statusCode?: number;
  timestamp: string;
}
