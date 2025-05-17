import { Injectable, NotFoundException } from '@nestjs/common';

import type { Task } from '~/common/entities/task.entity';
import type { User } from '~/common/entities/user.entity';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private tasksRepository: TasksRepository) {}

  public async getTasks(filterDto: GetFilteredTasksDto, user?: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  public async getTaskById(id: string, user?: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, user: user && user },
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

  public async deleteTask(id: string, user: User): Promise<void> {
    const affectedRows = await this.tasksRepository.deleteTask(id, user);

    if (affectedRows === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  public async updateTaskStatus(id: string, { status }: UpdateTaskStatusDto, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;

    return this.tasksRepository.save(task);
  }
}
