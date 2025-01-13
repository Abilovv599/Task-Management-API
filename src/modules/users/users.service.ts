import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public createUser(createUserDto: CreateUserDto) {
    return this.usersRepository.createUser(createUserDto);
  }

  public getUsers() {
    return this.usersRepository.getUsers();
  }

  public getUserByEmail(username: string) {
    return this.usersRepository.getUserByUsername(username);
  }

  public getUserById(id: string) {
    return this.usersRepository.getUserById(id);
  }
}
