import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';

import { ISuccessResponseModel } from '~/common/success-response.model';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(
        (data): ISuccessResponseModel<typeof data> => ({
          data: instanceToPlain(data),
          isSuccess: true,
          timestamp: new Date().toISOString(),
        }),
      ),
    );
  }
}
