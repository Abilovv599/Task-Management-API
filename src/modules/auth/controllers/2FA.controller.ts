import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';



import { IQrCodeUrl } from '~/modules/auth/interfaces/qr-code-url.interface';



import { User } from '~/common/entities/user.entity';
import { DataResult } from '~/common/models/data-result.model';
import { SuccessResult } from '~/common/models/success-result.model';
import { CurrentUser } from '~/decorators/current-user.decorator';
import { SkipAuth } from '~/decorators/skip-auth.decorator';



import { TwoFactorAuthCredentialsDto } from '../dto/2FA-credentials.dto';
import { OtpCodeDto } from '../dto/OTP-code.dto';
import { IAccessToken } from '../interfaces/access-token.interface';
import { TwoFactorAuthService } from '../services/2FA.service';





@ApiTags('2FA')
@Controller('auth/2FA')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate-secret')
  public async generate2FASecret(@CurrentUser() user: User): Promise<DataResult<IQrCodeUrl>> {
    return new DataResult(await this.twoFactorAuthService.generate2FASecret(user));
  }

  @Post('enable')
  public async enable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto): Promise<SuccessResult> {
    return new SuccessResult(await this.twoFactorAuthService.enable2FA(user, otpCode));
  }

  @Post('disable')
  public async disable2FA(
    @CurrentUser() user: User,
    @Body() { otpCode }: OtpCodeDto,
  ): Promise<SuccessResult> {
    return new SuccessResult(await this.twoFactorAuthService.disable2FA(user, otpCode));
  }

  @SkipAuth()
  @Post('login')
  public async singInWith2FA(
    @Body() twoFactorAuthCredentialsDto: TwoFactorAuthCredentialsDto,
  ): Promise<DataResult<IAccessToken>> {
    return new DataResult(await this.twoFactorAuthService.singInWith2FA(twoFactorAuthCredentialsDto));
  }
}
