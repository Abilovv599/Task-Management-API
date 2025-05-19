import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '~/modules/users/users.service';

import { User } from '~/common/entities/user.entity';
import { comparePassword } from '~/lib/bcrypt';

import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { IAccessToken } from '../interfaces/access-token.interface';
import { IEnabled2FA } from '../interfaces/enabled-2FA.interface';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { email, password } = authCredentialsDto;

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      const error = new NotFoundException(`User with email ${email} not found`);
      throw new UnauthorizedException(error.message);
    }

    const isMatched = await comparePassword(password, user.password!);

    if (!isMatched) {
      throw new UnauthorizedException('Passwords do not match');
    }

    return user;
  }

  public async generateJwtToken(user: User): Promise<IAccessToken> {
    const payload: IJwtPayload = { email: user.email, sub: user.id };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  public async signIn(authCredentialsDto: AuthCredentialsDto): Promise<IAccessToken | IEnabled2FA> {
    const user = await this.validateUser(authCredentialsDto);

    if (user.isTwoFactorEnabled) {
      return { requires2FA: true, email: user.email };
    }

    return this.generateJwtToken(user);
  }

  public signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.usersService.createUser(authCredentialsDto);
  }
}
