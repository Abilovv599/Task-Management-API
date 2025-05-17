import { IBaseResponseModel } from '~/common/base-response.model';

export interface IErrorResponseModel extends IBaseResponseModel {
  statusCode: number;
  message: string;
  path: string;
  error: {
    errors: string[];
  };
  timestamp: string;
}
