import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TwoFactorAuthCredentialsDto } from '~/modules/auth/dtos/2FA-credentials.dto';
import { OtpCodeDto } from '~/modules/auth/dtos/OTP-code.dto';
import { IQrCodeUrl } from '~/modules/auth/interfaces/qr-code-url.interface';
import { User } from '~/modules/users/entity/user.entity';

import { CurrentUser } from '~/common/decorators/current-user.decorator';
import { SkipAuth } from '~/common/decorators/skip-auth.decorator';

import { IAccessToken } from '../interfaces/access-token.interface';
import { TwoFactorAuthService } from '../services/2FA.service';

@ApiTags('2FA')
@Controller('auth/2FA')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate-secret')
  public async generate2FASecret(@CurrentUser() user: User): Promise<IQrCodeUrl> {
    return await this.twoFactorAuthService.generate2FASecret(user);
  }

  @Post('enable')
  public async enable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto): Promise<string> {
    return await this.twoFactorAuthService.enable2FA(user, otpCode);
  }

  @Post('disable')
  public async disable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto): Promise<string> {
    return await this.twoFactorAuthService.disable2FA(user, otpCode);
  }

  @SkipAuth()
  @Post('login')
  public async singInWith2FA(
    @Body() twoFactorAuthCredentialsDto: TwoFactorAuthCredentialsDto,
  ): Promise<IAccessToken> {
    return await this.twoFactorAuthService.singInWith2FA(twoFactorAuthCredentialsDto);
  }
}
