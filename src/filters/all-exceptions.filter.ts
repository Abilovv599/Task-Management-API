import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

import { ErrorResponseDto } from '~/common/dtos/error-response.dto';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponseDto = {
      statusCode: 500,
      path: request.url,
      message: '',
      error: {
        errors: [],
      },
      isSuccess: false,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      errorResponse.message = exception.message;

      const message = exception.getResponse();

      if (typeof message === 'object' && 'message' in message) {
        if (typeof message.message === 'string') {
          errorResponse.error.errors.push(message.message);
        } else {
          errorResponse.error.errors = message.message as string[];
        }
      } else if (typeof message === 'string') {
        errorResponse.error.errors.push(message);
      }
    } else if (exception instanceof TypeORMError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = exception.message;
      errorResponse.error.errors.push(exception.message);
    } else {
      errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse.message = 'Internal Server Error';
    }

    response.status(errorResponse.statusCode).json(errorResponse);

    super.catch(exception, host);
  }
}
