import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, DeleteResult, SelectQueryBuilder } from 'typeorm';

import { PaginationService } from '~/modules/common/services/pagination.service';
import { GetFilteredTasksDto } from '~/modules/tasks/dtos/get-filtered-tasks.dto';
import { Task } from '~/modules/tasks/entity/task.entity';
import { TaskStatus } from '~/modules/tasks/enums/task-status.enum';
import { User } from '~/modules/users/entity/user.entity';
import { Role } from '~/modules/users/enums/role.enum';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { PaginatedList } from '~/common/models/paginated-list.model';

import { TasksRepository } from './tasks.repository';

describe('TasksRepository', () => {
  let tasksRepository: TasksRepository;
  let paginationService: jest.Mocked<PaginationService>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Task>>;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    isTwoFactorEnabled: false,
    isOAuthUser: false,
    role: Role.User,
    tasks: [],
  };

  beforeEach(async () => {
    // Create a mock for QueryBuilder
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Task>>;

    // Create mocks for dependencies
    const mockDataSource = {
      createEntityManager: jest.fn(),
    };

    const mockPaginationService = {
      paginate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksRepository,
        { provide: DataSource, useValue: mockDataSource },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile();

    tasksRepository = module.get<TasksRepository>(TasksRepository);
    paginationService = module.get<jest.Mocked<PaginationService>>(PaginationService);

    // Mock createQueryBuilder
    jest.spyOn(tasksRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);
  });

  describe('getTasks', () => {
    const mockTasks: Task[] = [
      {
        id: 'test-task-id-1',
        title: 'Test task 1',
        description: 'Test description 1',
        status: TaskStatus.Open,
        user: mockUser,
      },
      {
        id: 'test-task-id-2',
        title: 'Test task 2',
        description: 'Test description 2',
        status: TaskStatus.InProgress,
        user: mockUser,
      },
    ];

    it('should call paginationService.paginate with correct parameters', async () => {
      // Arrange
      const filterDto: GetFilteredTasksDto = {};
      const paginationDto: PaginationDto = { page: 2, limit: 15 };
      const mockPaginatedList = new PaginatedList<Task>(mockTasks, 2, 2, 15);

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await tasksRepository.getTasks(filterDto, paginationDto);

      // Assert
      expect(tasksRepository.createQueryBuilder).toHaveBeenCalledWith('tasks');
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 2, 15);
      expect(result).toEqual(mockPaginatedList);
    });

    it('should filter by user if provided', async () => {
      // Arrange
      const filterDto: GetFilteredTasksDto = {};
      const paginationDto: PaginationDto = {};
      const mockPaginatedList = new PaginatedList<Task>(mockTasks, 2, 1, 10);

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await tasksRepository.getTasks(filterDto, paginationDto, mockUser);

      // Assert
      expect(queryBuilder.where).toHaveBeenCalledWith({ user: mockUser });
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 1, 10);
      expect(result).toEqual(mockPaginatedList);
    });

    it('should filter by status if provided', async () => {
      // Arrange
      const filterDto: GetFilteredTasksDto = { status: TaskStatus.Open };
      const paginationDto: PaginationDto = {};
      const mockPaginatedList = new PaginatedList<Task>(
        [mockTasks[0]], // Only the Open task
        1,
        1,
        10,
      );

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await tasksRepository.getTasks(filterDto, paginationDto);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('tasks.status = :status', {
        status: TaskStatus.Open,
      });
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 1, 10);
      expect(result).toEqual(mockPaginatedList);
    });

    it('should filter by search if provided', async () => {
      // Arrange
      const filterDto: GetFilteredTasksDto = { search: 'test' };
      const paginationDto: PaginationDto = {};
      const mockPaginatedList = new PaginatedList<Task>(mockTasks, 2, 1, 10);

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await tasksRepository.getTasks(filterDto, paginationDto);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(tasks.title) LIKE LOWER(:search) OR LOWER(tasks.description) LIKE LOWER(:search))',
        { search: '%test%' },
      );
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 1, 10);
      expect(result).toEqual(mockPaginatedList);
    });

    it('should apply all filters if provided', async () => {
      // Arrange
      const filterDto: GetFilteredTasksDto = { status: TaskStatus.Open, search: 'test' };
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const mockPaginatedList = new PaginatedList<Task>(
        [mockTasks[0]], // Only the Open task
        1,
        2,
        5,
      );

      paginationService.paginate.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await tasksRepository.getTasks(filterDto, paginationDto, mockUser);

      // Assert
      expect(queryBuilder.where).toHaveBeenCalledWith({ user: mockUser });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('tasks.status = :status', {
        status: TaskStatus.Open,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(tasks.title) LIKE LOWER(:search) OR LOWER(tasks.description) LIKE LOWER(:search))',
        { search: '%test%' },
      );
      expect(paginationService.paginate).toHaveBeenCalledWith(queryBuilder, 2, 5);
      expect(result).toEqual(mockPaginatedList);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and return the number of affected rows', async () => {
      // Arrange
      const taskId = 'test-task-id';

      const deleteResult: DeleteResult = {
        raw: {},
        affected: 1,
      };

      jest.spyOn(tasksRepository, 'delete').mockResolvedValue(deleteResult);

      // Act
      const result = await tasksRepository.deleteTask(taskId, mockUser);

      // Assert
      expect(tasksRepository.delete).toHaveBeenCalledWith({ id: taskId, user: mockUser });
      expect(result).toEqual(1);
    });

    it('should return 0 if no task was deleted', async () => {
      // Arrange
      const taskId = 'non-existent-task-id';

      const deleteResult: DeleteResult = {
        raw: {},
        affected: 0,
      };

      jest.spyOn(tasksRepository, 'delete').mockResolvedValue(deleteResult);

      // Act
      const result = await tasksRepository.deleteTask(taskId, mockUser);

      // Assert
      expect(tasksRepository.delete).toHaveBeenCalledWith({ id: taskId, user: mockUser });
      expect(result).toEqual(0);
    });

    it('should return 0 if affected is null', async () => {
      // Arrange
      const taskId = 'test-task-id';

      const deleteResult: DeleteResult = {
        raw: {},
        affected: null,
      };

      jest.spyOn(tasksRepository, 'delete').mockResolvedValue(deleteResult);

      // Act
      const result = await tasksRepository.deleteTask(taskId, mockUser);

      // Assert
      expect(tasksRepository.delete).toHaveBeenCalledWith({ id: taskId, user: mockUser });
      expect(result).toEqual(0);
    });
  });
});
