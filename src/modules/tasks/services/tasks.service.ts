import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTaskDto } from '~/modules/tasks/dtos/create-task.dto';
import { GetFilteredTasksDto } from '~/modules/tasks/dtos/get-filtered-tasks.dto';
import { UpdateTaskStatusDto } from '~/modules/tasks/dtos/update-task-status.dto';
import { Task } from '~/modules/tasks/entity/task.entity';
import { User } from '~/modules/users/entity/user.entity';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { PaginatedList } from '~/common/models/paginated-list.model';

import { TasksRepository } from '../repository/tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  public async getTasks(
    filterDto: GetFilteredTasksDto,
    paginationDto: PaginationDto,
    user?: User,
  ): Promise<PaginatedList<Task>> {
    return this.tasksRepository.getTasks(filterDto, paginationDto, user);
  }

  public async getTaskById(id: string, user?: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, user: user },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  public createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const newTask = this.tasksRepository.create({ ...createTaskDto, user });

    return this.tasksRepository.save(newTask);
  }

  public async deleteTask(id: string, user: User): Promise<string> {
    const affectedRows = await this.tasksRepository.deleteTask(id, user);

    if (affectedRows === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return 'Task deleted successfully.';
  }

  public async updateTaskStatus(id: string, { status }: UpdateTaskStatusDto, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;

    return this.tasksRepository.save(task);
  }
}
