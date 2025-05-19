import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { ExchangeCodeDto } from '~/modules/auth/dtos/exchange-code.dto';
import { GoogleAuthGuard } from '~/modules/common/guards/google-auth.guard';
import { User } from '~/modules/users/entity/user.entity';

import { CurrentUser } from '~/common/decorators/current-user.decorator';
import { SkipAuth } from '~/common/decorators/skip-auth.decorator';

import { IAccessToken } from '../interfaces/access-token.interface';
import { GoogleAuthService } from '../services/google-auth.service';

@Controller('auth')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @SkipAuth()
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  public googleAuth(): void {
    return;
  }

  @SkipAuth()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(@CurrentUser() user: User, @Res() res: Response): Promise<void> {
    const redirectUrl = await this.googleAuthService.generateAuthCodeAndRedirectUrl(user);

    return res.redirect(redirectUrl);
  }

  @SkipAuth()
  @Post('google/exchange-code')
  public async exchangeCode(@Body() { code }: ExchangeCodeDto): Promise<IAccessToken> {
    return await this.googleAuthService.exchangeAuthCode(code);
  }
}
