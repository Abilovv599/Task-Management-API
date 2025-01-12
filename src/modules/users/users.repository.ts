import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly dataSource: DataSource) {}

  private readonly repository = this.dataSource.getRepository(User);

  public createUser(createUserDto: CreateUserDto) {
    const newUser = this.repository.create(createUserDto);

    return this.repository.save(newUser);
  }

  public getUsers() {
    return this.repository.find();
  }
}
