import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '../../lib/bcrypt';

@Injectable()
export class UsersRepository {
  constructor(private readonly dataSource: DataSource) {}

  private readonly repository = this.dataSource.getRepository(User);

  public async createUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    const isExistingUser = await this.repository.existsBy({ username });

    if (isExistingUser) {
      throw new ConflictException(
        `User with username ${username} already exists`,
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = this.repository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.repository.save(newUser);
  }

  public getUsers() {
    return this.repository.find();
  }

  public async getUserByUsername(username: string) {
    const isUserExists = await this.repository.existsBy({ username });

    if (!isUserExists) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return this.repository.findOneBy({ username });
  }

  public async getUserById(id: string) {
    const isUserExists = await this.repository.existsBy({ id });

    if (!isUserExists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.repository.findOneBy({ id });
  }
}
