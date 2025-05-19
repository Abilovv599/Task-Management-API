import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '~/modules/users/users.service';

import { User } from '~/common/entities/user.entity';

import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')!,
    });
  }

  public async validate(payload: IJwtPayload): Promise<User> {
    try {
      return await this.userService.getUserById(payload.sub);
    } catch (error) {
      throw new UnauthorizedException((error as HttpException).message);
    }
  }
}
