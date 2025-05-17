import { IBaseResponseModel } from '~/common/base-response.model';

export interface IErrorResponseModel extends IBaseResponseModel {
  path: string;
  error: {
    errors: string[];
  };
}
