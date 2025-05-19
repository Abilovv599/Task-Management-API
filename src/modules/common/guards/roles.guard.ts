import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { User } from '~/modules/users/entity/user.entity';
import { Role } from '~/modules/users/enums/role.enum';

import { ROLES_KEY } from '~/common/decorators/allowed-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const { role } = request.user as User;

    return requiredRoles.includes(role);
  }
}
