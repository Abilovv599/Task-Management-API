import { IBaseResponseModel } from '~/models/base-response.model';

export interface ISuccessResponseModel<T> extends IBaseResponseModel {
  data: T | null;
}
