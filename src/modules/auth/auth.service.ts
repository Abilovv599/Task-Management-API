import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';

import { UsersService } from '~/modules/users/users.service';

import type { User } from '~/core/entities/user.entity';
import { comparePassword } from '~/lib/bcrypt';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import type { AccessTokenInterface } from './interfaces/access-token.interface';
import type { JwtPayloadInterface } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async validateUser(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<User> {
    const { email, password } = authCredentialsDto;

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      const error = new NotFoundException(
        `User with username ${email} not found`,
      );
      throw new UnauthorizedException(error.message);
    }

    const isMatched = await comparePassword(password, user.password!);

    if (!isMatched) {
      throw new UnauthorizedException('Passwords do not match');
    }

    return user;
  }

  async validateGoogleUser(email: string): Promise<User> {
    const user = await this.usersService.getUserByEmail(email);

    if (user) return user;

    return await this.usersService.createGoogleUser(email);
  }

  public async generateJwtToken(user: User): Promise<AccessTokenInterface> {
    const payload: JwtPayloadInterface = { email: user.email, sub: user.id };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  public async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<AccessTokenInterface> {
    const user = await this.validateUser(authCredentialsDto);

    return this.generateJwtToken(user);
  }

  public signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.usersService.createUser(authCredentialsDto);
  }

  public async generateAuthCode(user: User): Promise<string> {
    const code = randomBytes(16).toString('hex'); // Generate a secure random code
    await this.cacheManager.set(`code:${code}`, user, 5 * 60 * 1000); // Store for 5 minutes
    return code;
  }

  public async exchangeAuthCode(
    code: string,
  ): Promise<AccessTokenInterface | null> {
    const user = await this.cacheManager.get<User>(`code:${code}`);
    if (!user) return null;

    await this.cacheManager.del(`code:${code}`); // Remove after use
    return this.generateJwtToken(user); // Generate JWT token
  }
}
