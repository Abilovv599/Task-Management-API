import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

import { TwoFactorAuthCredentialsDto } from '~/modules/auth/dtos/2FA-credentials.dto';
import { IQrCodeUrl } from '~/modules/auth/interfaces/qr-code-url.interface';
import { User } from '~/modules/users/entity/user.entity';
import { UsersService } from '~/modules/users/services/users.service';

import { IAccessToken } from '../interfaces/access-token.interface';
import { AuthService } from './auth.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  public async generate2FASecret(user: User): Promise<IQrCodeUrl> {
    if (user.isOAuthUser) {
      throw new BadRequestException("OAuth user's can't generate 2FA secret");
    }

    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.email, 'Task Management', secret);

    const qrCodeUrl = await toDataURL(otpAuthUrl);

    user.twoFactorSecret = secret;
    await this.usersService.updateUser(user);

    return { qrCodeUrl };
  }

  public async enable2FA(user: User, otpCode: string): Promise<string> {
    if (user.isOAuthUser) {
      throw new BadRequestException("OAuth user's can't enable 2FA");
    }

    if (!user.twoFactorSecret) {
      throw new UnauthorizedException('2FA secret not found. Generate it first.');
    }

    this.verifyOtpCode(user, otpCode);

    user.isTwoFactorEnabled = true;
    await this.usersService.updateUser(user);

    return '2FA enabled successfully.';
  }

  public verifyOtpCode(user: User, token: string) {
    if (!user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is not set up for this account.');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
  }

  public async disable2FA(user: User, otpCode: string): Promise<string> {
    if (!user.isTwoFactorEnabled) throw new UnauthorizedException('2FA is not set up for this account.');

    this.verifyOtpCode(user, otpCode);

    user.twoFactorSecret = undefined;
    user.isTwoFactorEnabled = false;

    await this.usersService.updateUser(user);

    return '2FA disabled successfully.';
  }

  public async singInWith2FA({ email, otpCode }: TwoFactorAuthCredentialsDto): Promise<IAccessToken> {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) throw new UnauthorizedException('User not found.');

    this.verifyOtpCode(user, otpCode);

    return await this.authService.generateJwtToken(user);
  }
}
