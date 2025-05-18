import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';



import { Strategy, VerifyCallback } from 'passport-google-oauth2';



import { User } from '~/common/entities/user.entity';



import { IGoogleProfile } from '../interfaces/google-profile.interface';
import { GoogleAuthService } from '../services/google-auth.service';





@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
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
    profile: IGoogleProfile,
    cb: VerifyCallback,
  ): Promise<User> {
    const user = await this.googleAuthService.validateGoogleUser(profile.email);

    cb(null, user);

    return user;
  }
}
