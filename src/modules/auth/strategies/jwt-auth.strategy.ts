import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '~/modules/users/entity/user.entity';
import { UsersService } from '~/modules/users/services/users.service';

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
