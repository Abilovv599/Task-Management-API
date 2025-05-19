import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, SelectQueryBuilder } from 'typeorm';

import { PaginationService } from '~/modules/common/services/pagination.service';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { User } from '~/common/entities/user.entity';
import { Role } from '~/common/enums/role.enum';
import { PaginatedList } from '~/common/models/paginated-list.model';

import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let paginationService: jest.Mocked<PaginationService>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<User>>;

  beforeEach(async () => {
    // Create a mock for QueryBuilder
    queryBuilder = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<User>>;

    // Create mocks for dependencies
    const mockDataSource = {
      createEntityManager: jest.fn(),
    };

    const mockPaginationService = {
      paginate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: DataSource, useValue: mockDataSource },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    paginationService = module.get<jest.Mocked<PaginationService>>(PaginationService);

    // Mock createQueryBuilder
    jest.spyOn(usersRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);
  });

  describe('getUsers', () => {
    it('should call paginationService.paginate with correct parameters', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 2, limit: 15 };
      const mockUsers: User[] = [
        {
          id: 'test-id-1',
          email: 'test1@example.com',
          isTwoFactorEnabled: false,
          isOAuthUser: false,
          role: Role.Admin,
          tasks: [],
        },
        {
          id: 'test-id-2',
          email: 'test2@example.com',
          isTwoFactorEnabled: false,
          isOAuthUser: false,
          role: Role.User,
          tasks: [],
        },
      ];
      const mockPaginatedList = new PaginatedList<User>(mockUsers, 2, 2, 15);

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await usersRepository.getUsers(paginationDto);

      // Assert
      expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('users');
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 2, 15);
      expect(result).toEqual(mockPaginatedList);
    });

    it('should use default pagination values if not provided', async () => {
      // Arrange
      const paginationDto: PaginationDto = {};
      const mockUsers: User[] = [
        {
          id: 'test-id-1',
          email: 'test1@example.com',
          isTwoFactorEnabled: false,
          isOAuthUser: false,
          role: Role.Admin,
          tasks: [],
        },
      ];
      const mockPaginatedList = new PaginatedList<User>(mockUsers, 1, 1, 10);

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await usersRepository.getUsers(paginationDto);

      // Assert
      expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('users');
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 1, 10);
      expect(result).toEqual(mockPaginatedList);
    });
  });
});
