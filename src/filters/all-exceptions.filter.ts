import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Response } from 'express';
import { QueryFailedError, TypeORMError } from 'typeorm';

import { ErrorResult } from '~/common/models/error-result.model';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResult = this.handleException(exception);

    response.status(errorResult.error.statusCode).json(errorResult);
  }

  private handleException(exception: unknown): ErrorResult {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (exception instanceof QueryFailedError) {
      return this.handleQueryFailedError(exception);
    }

    if (exception instanceof TypeORMError) {
      return this.handleTypeORMError(exception);
    }

    if (exception instanceof Error) {
      return this.handleGenericError(exception);
    }

    // fallback generic error result
    return new ErrorResult(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }

  private handleHttpException(exception: HttpException): ErrorResult {
    const status = exception.getStatus();
    const message = exception.message;
    let details: string[] | undefined;

    const responseDetails = exception.getResponse();
    if (
      typeof responseDetails === 'object' &&
      'message' in responseDetails &&
      Array.isArray(responseDetails.message)
    ) {
      details = responseDetails.message;
    }

    return new ErrorResult(status, message, details);
  }

  private handleQueryFailedError(exception: QueryFailedError<any>): ErrorResult {
    const status = HttpStatus.BAD_REQUEST;
    // Optional: you can hide sensitive DB details here if needed
    const message = `Database query failed: ${exception.message}`;

    return new ErrorResult(status, message);
  }

  private handleTypeORMError(exception: TypeORMError): ErrorResult {
    const status = HttpStatus.BAD_REQUEST;
    const message = exception.message;

    return new ErrorResult(status, message);
  }

  private handleGenericError(exception: Error): ErrorResult {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal Server Error';

    return new ErrorResult(status, message);
  }
}
