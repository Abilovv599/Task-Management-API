import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { User } from '~/common/entities/user.entity';
import { DataResult } from '~/common/models/data-result.model';
import { PaginatedList } from '~/common/models/paginated-list.model';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<DataResult<User>> {
    return new DataResult(await this.usersService.createUser(createUserDto));
  }

  @Get()
  public async getUsers(@Query() paginationDto: PaginationDto): Promise<DataResult<PaginatedList<User>>> {
    return new DataResult(await this.usersService.getUsers(paginationDto));
  }

  @Get(':id')
  public async getUserById(@Param('id') id: string): Promise<DataResult<User>> {
    return new DataResult(await this.usersService.getUserById(id));
  }
}
