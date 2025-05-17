import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

import { IErrorResponseModel } from '~/common/error-response.model';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: IErrorResponseModel = {
      statusCode: 500,
      path: request.url,
      message: '',
      error: {
        errors: [],
      },
      isSuccess: false,
      timestamp: new Date().toISOString(),
    };

    // Add more Prisma Error Types if you want
    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      errorResponse.message = exception.message;

      const messages = exception.getResponse();

      if (typeof messages === 'object' && 'message' in messages) {
        errorResponse.error.errors = messages.message as string[];
      } else if (typeof messages === 'string') {
        errorResponse.error.errors.push(messages);
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
