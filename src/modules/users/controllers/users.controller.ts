import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { CreateUserDto } from '~/modules/users/dtos/create-user.dto';
import { User } from '~/modules/users/entity/user.entity';
import { Role } from '~/modules/users/enums/role.enum';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { PaginatedList } from '~/common/models/paginated-list.model';
import { AllowedRoles } from '~/decorators/allowed-roles.decorator';

import { UsersService } from '../services/users.service';

@AllowedRoles([Role.Admin])
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  public async getUsers(@Query() paginationDto: PaginationDto): Promise<PaginatedList<User>> {
    return await this.usersService.getUsers(paginationDto);
  }

  @Get(':id')
  public async getUserById(@Param('id') id: string): Promise<User> {
    return await this.usersService.getUserById(id);
  }
}
