import { Body, Controller, Get, Post } from '@nestjs/common';

import { User } from '~/modules/users/entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  public getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }
}
