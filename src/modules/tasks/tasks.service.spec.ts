import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';



import { PaginationDto } from '~/common/dtos/pagination.dto';
import { TASK_STATUS } from '~/common/enums/task-status.enum';
import { PaginatedList } from '~/common/models/paginated-list.model';



import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';





const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  deleteTask: jest.fn(),
});

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  isTwoFactorEnabled: false,
  isOAuthUser: false,
  tasks: [],
};

const mockTask = {
  id: 'test-task-id',
  title: 'Test task',
  description: 'Test description',
  status: TASK_STATUS.OPEN,
  user: mockUser,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: jest.Mocked<TasksRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: TasksRepository, useFactory: mockTasksRepository }],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get<jest.Mocked<TasksRepository>>(TasksRepository);
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      tasksRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById('test-task-id', mockUser);
      expect(result).toEqual(mockTask);
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-task-id', user: mockUser },
      });
    });

    it('throws an error if task is not found', async () => {
      tasksRepository.findOne.mockResolvedValue(null);
      await expect(tasksService.getTaskById('test-task-id', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls TasksRepository.create and returns the result', async () => {
      tasksRepository.create.mockReturnValue(mockTask);
      tasksRepository.save.mockResolvedValue(mockTask);

      const createTaskDto = { title: 'Test task', description: 'Test description' };
      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(tasksRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        user: mockUser,
      });
      expect(tasksRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      // Arrange
      const filterDto: GetFilteredTasksDto = { status: TASK_STATUS.OPEN, search: 'test' };
      const paginationDto: PaginationDto = { page: 2, limit: 15 };
      const mockTasks = [mockTask];
      const mockPaginatedList = new PaginatedList<any>(mockTasks, 1, 2, 15);

      tasksRepository.getTasks.mockResolvedValue(mockPaginatedList);

      // Act
      const result = await tasksService.getTasks(filterDto, paginationDto, mockUser);

      // Assert
      expect(tasksRepository.getTasks).toHaveBeenCalledWith(filterDto, paginationDto, mockUser);
      expect(result).toEqual(mockPaginatedList);
    });
  });

  describe('deleteTask', () => {
    it('calls TasksRepository.deleteTask and returns success message', async () => {
      // Arrange
      tasksRepository.deleteTask.mockResolvedValue(1);

      // Act
      const result = await tasksService.deleteTask('test-task-id', mockUser);

      // Assert
      expect(tasksRepository.deleteTask).toHaveBeenCalledWith('test-task-id', mockUser);
      expect(result).toEqual('Task deleted successfully.');
    });

    it('throws NotFoundException if task is not found', async () => {
      // Arrange
      tasksRepository.deleteTask.mockResolvedValue(0);

      // Act & Assert
      await expect(tasksService.deleteTask('test-task-id', mockUser)).rejects.toThrow(NotFoundException);
      expect(tasksRepository.deleteTask).toHaveBeenCalledWith('test-task-id', mockUser);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates task status and returns the updated task', async () => {
      // Arrange
      const updateTaskStatusDto: UpdateTaskStatusDto = { status: TASK_STATUS.DONE };
      const updatedTask = { ...mockTask, status: TASK_STATUS.DONE };

      tasksRepository.findOne.mockResolvedValue(mockTask);
      tasksRepository.save.mockResolvedValue(updatedTask);

      // Act
      const result = await tasksService.updateTaskStatus('test-task-id', updateTaskStatusDto, mockUser);

      // Assert
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-task-id', user: mockUser },
      });
      expect(tasksRepository.save).toHaveBeenCalledWith({ ...mockTask, status: TASK_STATUS.DONE });
      expect(result).toEqual(updatedTask);
    });

    it('throws NotFoundException if task is not found', async () => {
      // Arrange
      const updateTaskStatusDto: UpdateTaskStatusDto = { status: TASK_STATUS.DONE };

      tasksRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        tasksService.updateTaskStatus('test-task-id', updateTaskStatusDto, mockUser),
      ).rejects.toThrow(NotFoundException);
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-task-id', user: mockUser },
      });
    });
  });
});
