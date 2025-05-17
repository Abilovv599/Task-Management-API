import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';

import { ISuccessResponseModel } from '~/common/success-reponse.model';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const successResponse: ISuccessResponseModel<typeof data> = {
          isSuccess: true,
          data: instanceToPlain(data),
        };

        return successResponse;
      }),
    );
  }
}
