import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { IAccessToken } from '~/modules/auth/interfaces/access-token.interface';

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
  ): Promise<IAccessToken> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('profile')
  public getProfile(@CurrentUser() user: User): User {
    return user;
  }
}
