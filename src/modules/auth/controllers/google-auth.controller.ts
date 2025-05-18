import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';



import { Response } from 'express';



import { User } from '~/common/entities/user.entity';
import { DataResult } from '~/common/models/data-result.model';
import { CurrentUser } from '~/decorators/current-user.decorator';
import { SkipAuth } from '~/decorators/skip-auth.decorator';



import { ExchangeCodeDto } from '../dto/exchange-code.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
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
  public async exchangeCode(@Body() { code }: ExchangeCodeDto): Promise<DataResult<IAccessToken>> {
    return new DataResult(await this.googleAuthService.exchangeAuthCode(code));
  }
}
