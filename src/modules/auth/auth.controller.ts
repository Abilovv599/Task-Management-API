import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';

import type { Response } from 'express';

import type { User } from '~/core/entities/user.entity';
import { CurrentUser } from '~/decorators/current-user.decorator';
import { SkipAuth } from '~/decorators/skip-auth.decorator';

import { AuthService } from './auth.service';
import { TwoFactorAuthCredentialsDto } from './dto/2FA-credentials.dto';
import { OtpCodeDto } from './dto/OTP-code.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { AccessTokenInterface } from './interfaces/access-token.interface';
import type { Enabled2FAInterface } from './interfaces/enabled-2FA.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  public signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.authService.signUp(authCredentialsDto);
  }

  @SkipAuth()
  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  public googleAuth(): void {
    return;
  }

  @SkipAuth()
  @Get('login/google/callback')
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(@CurrentUser() user: User, @Res() res: Response): Promise<void> {
    const redirectUrl = await this.authService.generateAuthCodeAndRedirectUrl(user);

    return res.redirect(redirectUrl);
  }

  @SkipAuth()
  @Post('login/google/exchange-code')
  public async exchangeCode(@Body() { code }: ExchangeCodeDto): Promise<AccessTokenInterface | null> {
    return await this.authService.exchangeAuthCode(code);
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<AccessTokenInterface | Enabled2FAInterface> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('profile')
  public getProfile(@CurrentUser() user: User): User {
    return user;
  }

  @Post('generate-2fa-secret')
  public generate2FASecret(@CurrentUser() user: User) {
    return this.authService.generate2FASecret(user);
  }

  @Post('enable-2fa')
  public enable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto) {
    return this.authService.enable2FA(user, otpCode);
  }

  @Post('disable-2fa')
  public disable2FA(@CurrentUser() user: User, @Body() { otpCode }: OtpCodeDto) {
    return this.authService.disable2FA(user, otpCode);
  }

  @SkipAuth()
  @Post('login/2fa')
  public singInWith2FA(@Body() twoFactorAuthCredentialsDto: TwoFactorAuthCredentialsDto) {
    return this.authService.singInWith2FA(twoFactorAuthCredentialsDto);
  }
}
