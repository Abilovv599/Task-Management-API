import { Body, Controller, Get, Post } from '@nestjs/common';



import { User } from '~/common/entities/user.entity';
import { DataResult } from '~/common/models/data-result.model';
import { CurrentUser } from '~/decorators/current-user.decorator';
import { SkipAuth } from '~/decorators/skip-auth.decorator';



import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { IAccessToken } from '../interfaces/access-token.interface';
import { IEnabled2FA } from '../interfaces/enabled-2FA.interface';
import { AuthService } from '../services/auth.service';





@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('register')
  public async signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<DataResult<User>> {
    return new DataResult(await this.authService.signUp(authCredentialsDto));
  }

  @SkipAuth()
  @Post('login')
  public async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<DataResult<IAccessToken | IEnabled2FA>> {
    return new DataResult(await this.authService.signIn(authCredentialsDto));
  }

  @Get('profile')
  public getProfile(@CurrentUser() user: User): DataResult<User> {
    return new DataResult(user);
  }
}
