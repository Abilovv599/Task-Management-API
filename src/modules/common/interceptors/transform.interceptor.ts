import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';

import { DataResult } from '~/common/models/data-result.model';
import { SuccessResult } from '~/common/models/success-result.model';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next
      .handle()
      .pipe(
        map((data) =>
          instanceToPlain(typeof data === 'string' ? new SuccessResult(data) : new DataResult(data)),
        ),
      );
  }
}
