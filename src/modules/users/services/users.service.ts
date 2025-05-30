import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from '~/modules/users/dtos/create-user.dto';
import { User } from '~/modules/users/entity/user.entity';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { hashPassword } from '~/common/lib/bcrypt';
import { PaginatedList } from '~/common/models/paginated-list.model';

import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async getUsers(paginationDto: PaginationDto): Promise<PaginatedList<User>> {
    return await this.usersRepository.getUsers(paginationDto);
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const isExistingUser = await this.usersRepository.existsBy({ email });

    if (isExistingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }

  public async createGoogleUser(email: string): Promise<User> {
    const isExistingUser = await this.usersRepository.existsBy({ email });

    if (isExistingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const newUser = this.usersRepository.create({ email, isOAuthUser: true });

    return await this.usersRepository.save(newUser);
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async updateUser(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }
}
