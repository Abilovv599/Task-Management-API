import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { comparePassword } from '../../lib/bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  public signUp(authCredentialsDto: AuthCredentialsDto) {
    return this.usersService.createUser(authCredentialsDto);
  }

  public async signIn(authCredentialsDto: AuthCredentialsDto) {
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
}
