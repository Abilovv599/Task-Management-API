import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from '~/modules/users/dtos/create-user.dto';
import { User } from '~/modules/users/entity/user.entity';
import { Role } from '~/modules/users/enums/role.enum';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { PaginatedList } from '~/common/models/paginated-list.model';
import * as bcryptLib from '~/lib/bcrypt';

import { UsersRepository } from '../repository/users.repository';
import { UsersService } from './users.service';

// Mock the hashPassword function
jest.mock('~/lib/bcrypt', () => ({
  hashPassword: jest.fn(),
}));

const mockUsersRepository = () => ({
  getUsers: jest.fn(),
  findOneBy: jest.fn(),
  existsBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useFactory: mockUsersRepository }],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<jest.Mocked<UsersRepository>>(UsersRepository);
  });

  describe('getUsers', () => {
    it('calls UsersRepository.getUsers and returns the result', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockUsers: User[] = [
        {
          id: 'test-id-1',
          email: 'test1@example.com',
          isTwoFactorEnabled: false,
          isOAuthUser: false,
          role: Role.User,
          tasks: [],
        },
        {
          id: 'test-id-2',
          email: 'test2@example.com',
          isTwoFactorEnabled: false,
          isOAuthUser: false,
          role: Role.Admin,
          tasks: [],
        },
      ];
      const mockPaginatedList = new PaginatedList<User>(mockUsers, 2, 1, 10);
      usersRepository.getUsers.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await usersService.getUsers(paginationDto);

      // Assert
      expect(result).toEqual(mockPaginatedList);
      expect(usersRepository.getUsers).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('createUser', () => {
    it('throws ConflictException if user with email already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      usersRepository.existsBy.mockResolvedValue(true);

      // Act & Assert
      await expect(usersService.createUser(createUserDto)).rejects.toThrow(ConflictException);
      expect(usersRepository.existsBy).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
    });

    it('creates and returns a new user if email does not exist', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashed_password';
      const mockUser: User = {
        id: 'test-id',
        email: createUserDto.email,
        password: hashedPassword,
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      usersRepository.existsBy.mockResolvedValue(false);
      (bcryptLib.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await usersService.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.existsBy).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(bcryptLib.hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('createGoogleUser', () => {
    it('throws ConflictException if user with email already exists', async () => {
      // Arrange
      const email = 'test@example.com';
      usersRepository.existsBy.mockResolvedValue(true);

      // Act & Assert
      await expect(usersService.createGoogleUser(email)).rejects.toThrow(ConflictException);
      expect(usersRepository.existsBy).toHaveBeenCalledWith({ email });
    });

    it('creates and returns a new Google user if email does not exist', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser: User = {
        id: 'test-id',
        email,
        isTwoFactorEnabled: false,
        isOAuthUser: true,
        role: Role.User,
        tasks: [],
      };

      usersRepository.existsBy.mockResolvedValue(false);
      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await usersService.createGoogleUser(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.existsBy).toHaveBeenCalledWith({ email });
      expect(usersRepository.create).toHaveBeenCalledWith({
        email,
        isOAuthUser: true,
      });
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUserByEmail', () => {
    it('calls UsersRepository.findOneBy and returns the result', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser: User = {
        id: 'test-id',
        email,
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };
      usersRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const result = await usersService.getUserByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email });
    });

    it('returns null if user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      usersRepository.findOneBy.mockResolvedValue(null);

      // Act
      const result = await usersService.getUserByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email });
    });
  });

  describe('getUserById', () => {
    it('calls UsersRepository.findOneBy and returns the result', async () => {
      // Arrange
      const id = 'test-id';
      const mockUser: User = {
        id,
        email: 'test@example.com',
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };
      usersRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const result = await usersService.getUserById(id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id });
    });

    it('throws NotFoundException if user is not found', async () => {
      // Arrange
      const id = 'nonexistent-id';
      usersRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(usersService.getUserById(id)).rejects.toThrow(NotFoundException);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateUser', () => {
    it('calls UsersRepository.save and returns the result', async () => {
      // Arrange
      const mockUser: User = {
        id: 'test-id',
        email: 'test@example.com',
        isTwoFactorEnabled: true, // Updated value
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };
      usersRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await usersService.updateUser(mockUser);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
