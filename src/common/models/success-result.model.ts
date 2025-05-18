import { BaseResult } from './base-result.model';

export class SuccessResult extends BaseResult {
  message: string;

  constructor(message: string) {
    super(true);
    this.message = message;
  }
}
