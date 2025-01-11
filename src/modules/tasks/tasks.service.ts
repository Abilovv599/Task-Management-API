import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService {
  constructor(private tasksRepository: TasksRepository) {}

  public getTasks(filterDto: GetFilteredTasksDto) {
    return this.tasksRepository.getTasks(filterDto);
  }

  public getTaskById(id: string) {
    return this.tasksRepository.getTaskById(id);
  }

  public createTask(createTaskDto: CreateTaskDto) {
    return this.tasksRepository.createTask(createTaskDto);
  }

  public deleteTask(id: string) {
    return this.tasksRepository.deleteTask(id);
  }

  public updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksRepository.updateTaskStatus(id, updateTaskStatusDto);
  }
}
