import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthCredentialsDto } from '~/modules/auth/dtos/auth-credentials.dto';
import { User } from '~/modules/users/entity/user.entity';

import { CurrentUser } from '~/common/decorators/current-user.decorator';
import { SkipAuth } from '~/common/decorators/skip-auth.decorator';

import { IAccessToken } from '../interfaces/access-token.interface';
import { IEnabled2FA } from '../interfaces/enabled-2FA.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  public async signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return await this.authService.signUp(authCredentialsDto);
  }

  @SkipAuth()
  @Post('login')
  public async signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<IAccessToken | IEnabled2FA> {
    return await this.authService.signIn(authCredentialsDto);
  }

  @Get('profile')
  public getProfile(@CurrentUser() user: User): User {
    return user;
  }
}
