import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(private tasksRepository: TasksRepository) {}

  public async getTasks(filterDto: GetFilteredTasksDto, user?: User) {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  public async getTaskById(id: string, user?: User) {
    const task = await this.tasksRepository.findOne({
      where: { id, user: user && user },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  public createTask(createTaskDto: CreateTaskDto, user: User) {
    const newTask = this.tasksRepository.create({ ...createTaskDto, user });

    return this.tasksRepository.save(newTask);
  }

  public async deleteTask(id: string, user: User) {
    const affectedRows = await this.tasksRepository.deleteTask(id, user);

    if (affectedRows === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  public async updateTaskStatus(
    id: string,
    { status }: UpdateTaskStatusDto,
    user: User,
  ) {
    const task = await this.getTaskById(id, user);

    task.status = status;

    return this.tasksRepository.save(task);
  }
}
