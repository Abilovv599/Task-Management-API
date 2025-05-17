import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';



import type { User } from '~/common/entities/user.entity';
import { CurrentUser } from '~/decorators/current-user.decorator';
import { SkipAuth } from '~/decorators/skip-auth.decorator';



import { TwoFactorAuthCredentialsDto } from '../dto/2FA-credentials.dto';
import { OtpCodeDto } from '../dto/OTP-code.dto';
import { TwoFactorAuthService } from '../services/2FA.service';





@ApiTags('2FA')
@Controller('auth/2FA')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate-secret')
  public generate2FASecret(@CurrentUser() user: User) {
    return this.twoFactorAuthService.generate2FASecret(user);
  }

  @Post('enable')
  public enable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto) {
    return this.twoFactorAuthService.enable2FA(user, otpCode);
  }

  @Post('disable')
  public disable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto) {
    return this.twoFactorAuthService.disable2FA(user, otpCode);
  }

  @SkipAuth()
  @Post('login')
  public singInWith2FA(@Body() twoFactorAuthCredentialsDto: TwoFactorAuthCredentialsDto) {
    return this.twoFactorAuthService.singInWith2FA(twoFactorAuthCredentialsDto);
  }
}
