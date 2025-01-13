import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../../lib/bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public validateUserById(id: string) {
    return this.usersService.getUserById(id);
  }

  public async validateUser(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;

    const user = await this.usersService
      .getUserByEmail(username)
      .catch((error: NotFoundException) => {
        throw new UnauthorizedException(error.message);
      });

    const isMatched = await comparePassword(password, user.password);

    if (!isMatched) {
      throw new UnauthorizedException('Passwords do not match');
    }

    delete user.password;

    return user;
  }

  public async signIn(user: Omit<User, 'password'>) {
    const payload: JwtPayload = { username: user.username, sub: user.id };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  public signUp(authCredentialsDto: AuthCredentialsDto) {
    return this.usersService.createUser(authCredentialsDto);
  }
}
