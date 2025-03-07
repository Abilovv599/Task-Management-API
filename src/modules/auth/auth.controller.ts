import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Response } from 'express';

import { GoogleAuthGuard } from '~/modules/auth/guards/google-auth.guard';
import { IAccessToken } from '~/modules/auth/interfaces/access-token.interface';

import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @SkipAuth()
  @Post('register')
  public signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.authService.signUp(authCredentialsDto);
  }

  @SkipAuth()
  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  public googleAuth() {
    return;
  }

  // Google OAuth Callback
  @SkipAuth()
  @Get('login/google/callback')
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const code = await this.authService.generateAuthCode(user);

    const origin = this.configService.get<string>('FRONTEND_ORIGIN')!;

    return res.redirect(`${origin}/auth/callback?code=${code}`);
  }

  @SkipAuth()
  @Post('exchange-code')
  public async exchangeCode(@Body('code') code: string): Promise<IAccessToken> {
    if (!code) throw new BadRequestException('Code is required');

    const accessToken = await this.authService.exchangeAuthCode(code);

    if (!accessToken) throw new BadRequestException('Invalid or expired code');

    return accessToken;
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<IAccessToken> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('profile')
  public getProfile(@CurrentUser() user: User): User {
    return user;
  }
}
