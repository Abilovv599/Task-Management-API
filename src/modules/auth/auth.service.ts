import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '~/lib/bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async validateUser(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;

    const user = await this.usersService
      .getUserByUsername(username)
      .catch((error: NotFoundException) => {
        throw new UnauthorizedException(error.message);
      });

    const isMatched = await comparePassword(password, user.password);

    if (!isMatched) {
      throw new UnauthorizedException('Passwords do not match');
    }

    return user;
  }

  public async signIn(authCredentialsDto: AuthCredentialsDto) {
    const user = await this.validateUser(authCredentialsDto);

    const payload: JwtPayload = { username: user.username, sub: user.id };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  public signUp(authCredentialsDto: AuthCredentialsDto) {
    return this.usersService.createUser(authCredentialsDto);
  }
}
