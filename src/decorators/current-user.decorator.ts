import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

import { User } from '~/common/entities/user.entity';

const getCurrentUserByContext = (context: ExecutionContext) => {
  const request: Request = context.switchToHttp().getRequest();

  return request.user as User;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  getCurrentUserByContext(context),
);
