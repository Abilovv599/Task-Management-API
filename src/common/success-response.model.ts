import { IBaseResponseModel } from '~/common/base-response.model';

export interface ISuccessResponseModel<T> extends IBaseResponseModel {
  data: T;
}
