import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy, VerifyCallback } from 'passport-google-oauth2';

import { AuthService } from '~/modules/auth/auth.service';

import type { User } from '~/entities/user.entity';

import type { GoogleProfileInterface } from '../interfaces/google-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_AUTH_CLIENT_ID')!,
      callbackURL: configService.get('GOOGLE_AUTH_CALLBACK_URL')!,
      clientSecret: configService.get('GOOGLE_AUTH_CLIENT_SECRET')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string | undefined,
    profile: GoogleProfileInterface,
    cb: VerifyCallback,
  ): Promise<User> {
    const user = await this.authService.validateGoogleUser(profile.email);

    cb(null, user);

    return user;
  }
}
