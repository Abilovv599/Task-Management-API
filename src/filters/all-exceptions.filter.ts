import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Response } from 'express';
import { TypeORMError } from 'typeorm';

import { ErrorResult } from '~/common/models/error-result.model';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = new ErrorResult(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');

    if (exception instanceof HttpException) {
      errorResponse.error.statusCode = exception.getStatus();
      errorResponse.error.message = exception.message;

      const details = exception.getResponse();

      if (typeof details === 'object' && 'message' in details && Array.isArray(details.message)) {
        errorResponse.error.details = details.message;
      }
    } else if (exception instanceof TypeORMError) {
      errorResponse.error.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.error.message = exception.message;
    }

    response.status(errorResponse.error.statusCode).json(errorResponse);

    super.catch(exception, host);
  }
}
