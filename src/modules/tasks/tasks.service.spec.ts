import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';



import { TASK_STATUS } from '~/common/enums/task-status.enum';



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
});
