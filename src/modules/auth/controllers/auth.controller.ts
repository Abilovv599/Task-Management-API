import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';



import type { User } from '~/common/entities/user.entity';
import { CurrentUser } from '~/decorators/current-user.decorator';
import { SkipAuth } from '~/decorators/skip-auth.decorator';



import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import type { AccessTokenInterface } from '../interfaces/access-token.interface';
import type { Enabled2FAInterface } from '../interfaces/enabled-2FA.interface';
import { AuthService } from '../services/auth.service';





@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  public signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.authService.signUp(authCredentialsDto);
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
}
