import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';

import { UsersService } from '~/modules/users/users.service';

import type { User } from '~/common/entities/user.entity';

import type { AccessTokenInterface } from '../interfaces/access-token.interface';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async validateGoogleUser(email: string): Promise<User> {
    const user = await this.usersService.getUserByEmail(email);

    if (user) return user;

    return await this.usersService.createGoogleUser(email);
  }

  public async generateAuthCodeAndRedirectUrl(user: User): Promise<string> {
    const code = randomBytes(16).toString('hex'); // Generate a secure random code

    await this.cacheManager.set(`code:${code}`, user, 5 * 60 * 1000); // Store for 5 minutes

    const origin = this.configService.get<string>('FRONTEND_ORIGIN')!;

    return `${origin}/auth/callback?code=${code}`;
  }

  public async exchangeAuthCode(code: string): Promise<AccessTokenInterface | null> {
    const user = await this.cacheManager.get<User>(`code:${code}`);
    if (!user) return null;

    await this.cacheManager.del(`code:${code}`); // Remove after use

    const accessToken = await this.authService.generateJwtToken(user); // Generate JWT token

    if (!accessToken) throw new BadRequestException('Invalid or expired code');

    return accessToken;
  }
}
