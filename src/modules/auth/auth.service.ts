import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

import { UsersService } from '~/modules/users/users.service';

import type { User } from '~/core/entities/user.entity';
import { comparePassword } from '~/lib/bcrypt';

import { TwoFactorAuthCredentialsDto } from './dto/2FA-credentials.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import type { AccessTokenInterface } from './interfaces/access-token.interface';
import type { Enabled2FAInterface } from './interfaces/enabled-2FA.interface';
import type { JwtPayloadInterface } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async validateUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { email, password } = authCredentialsDto;

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      const error = new NotFoundException(`User with username ${email} not found`);
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
  ): Promise<AccessTokenInterface | Enabled2FAInterface> {
    const user = await this.validateUser(authCredentialsDto);

    if (user.isTwoFactorEnabled) {
      return { requires2FA: true, email: user.email };
    }

    return this.generateJwtToken(user);
  }

  public signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.usersService.createUser(authCredentialsDto);
  }

  public async generateAuthCodeAndRedirectUrl(user: User): Promise<string> {
    const code = randomBytes(16).toString('hex'); // Generate a secure random code

    await this.cacheManager.set(`code:${code}`, user, 5 * 60 * 1000); // Store for 5 minutes

    const origin = this.configService.get<string>('FRONTEND_ORIGIN')!;

    return `${origin}/auth/callback?code=${code}`;
  }

  public async exchangeAuthCode(code: string): Promise<AccessTokenInterface | null> {
    const user = await this.cacheManager.get<User>(`code:${code}`);
    if (!user) return null;

    await this.cacheManager.del(`code:${code}`); // Remove after use

    const accessToken = await this.generateJwtToken(user); // Generate JWT token

    if (!accessToken) throw new BadRequestException('Invalid or expired code');

    return accessToken;
  }

  public async generate2FASecret(user: User) {
    if (user.isOAuthUser) {
      throw new BadRequestException("OAuth user's can't generate 2FA secret");
    }

    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.email, 'Task Management', secret);

    const qrCodeUrl = await toDataURL(otpAuthUrl);

    user.twoFactorSecret = secret;
    await this.usersService.updateUser(user);

    return { qrCodeUrl };
  }

  public async enable2FA(user: User, otpCode: string): Promise<{ message: string }> {
    if (user.isOAuthUser) {
      throw new BadRequestException("OAuth user's can't enable 2FA");
    }

    if (!user.twoFactorSecret) {
      throw new UnauthorizedException('2FA secret not found. Generate it first.');
    }

    this.verify2FAToken(user, otpCode);

    user.isTwoFactorEnabled = true;
    await this.usersService.updateUser(user);

    return { message: '2FA enabled successfully.' };
  }

  public verify2FAToken(user: User, token: string) {
    if (!user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is not set up for this account.');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
  }

  public async disable2FA(user: User, otpCode: string) {
    if (!user.isTwoFactorEnabled) throw new UnauthorizedException('2FA is not set up for this account.');

    this.verify2FAToken(user, otpCode);

    user.twoFactorSecret = undefined;
    user.isTwoFactorEnabled = false;

    await this.usersService.updateUser(user);

    return { message: '2FA disabled successfully.' };
  }

  public async singInWith2FA({ email, otpCode }: TwoFactorAuthCredentialsDto): Promise<AccessTokenInterface> {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) throw new UnauthorizedException('User not found.');

    this.verify2FAToken(user, otpCode);

    return await this.generateJwtToken(user);
  }
}
