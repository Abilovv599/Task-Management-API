import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '~/lib/bcrypt';
import { User } from '~/modules/users/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async getUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password } = createUserDto;
    const isExistingUser = await this.usersRepository.existsBy({ username });

    if (isExistingUser) {
      throw new ConflictException(
        `User with username ${username} already exists`,
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }

  public async getUserByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}
