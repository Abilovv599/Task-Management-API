import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { User } from '~/common/entities/user.entity';
import { Role } from '~/common/enums/role.enum';
import { PaginatedList } from '~/common/models/paginated-list.model';
import { AllowedRoles } from '~/decorators/allowed-roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

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
