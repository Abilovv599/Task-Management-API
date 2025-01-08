import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './models/task.model';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: '0',
      title: 'todo',
      status: TaskStatus.OPEN,
      description: 'make todo app',
    },
  ];

  public async getAllTasks() {
    return this.tasks;
  }

  public async getFilteredTasks(filterDto: GetFilteredTasksDto) {
    const { status, search } = filterDto;

    let tasks = await this.getAllTasks();

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (search) {
      tasks = tasks.filter((task) => {
        return task.title.includes(search) || task.description.includes(search);
      });
    }

    return tasks;
  }

  public async getTaskById(id: string) {
    return this.tasks.find((task) => task.id === id);
  }

  public async createTask(task: CreateTaskDto) {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36),
      status: TaskStatus.OPEN,
    };

    this.tasks.push(newTask);

    return newTask;
  }
}
