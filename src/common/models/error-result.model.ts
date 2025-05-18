import { HttpStatus } from '@nestjs/common';

import { BaseResult } from './base-result.model';

interface IResultError {
  statusCode: HttpStatus;
  message: string;
  details?: unknown;
}

export class ErrorResult extends BaseResult {
  error: IResultError;

  constructor(statusCode: HttpStatus, message: string, details?: unknown) {
    super(false);

    this.error = {
      statusCode,
      message,
      details,
    };
  }
}
