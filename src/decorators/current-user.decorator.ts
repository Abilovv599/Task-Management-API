import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import type { Request } from 'express';

import type { User } from '~/entities/user.entity';

const getCurrentUserByContext = (context: ExecutionContext) => {
  const request: Request = context.switchToHttp().getRequest();

  return request.user as User;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
