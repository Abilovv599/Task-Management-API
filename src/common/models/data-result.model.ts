import { BaseResult } from './base-result.model';

export class DataResult<T> extends BaseResult {
  data: T;

  constructor(data: T) {
    super(true);
    this.data = data;
  }
}
