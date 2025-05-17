import { IBaseResponseModel } from '~/models/base-response.model';

export interface IErrorResponseModel extends IBaseResponseModel {
  path: string;
  error: {
    errors: string[];
  };
}
