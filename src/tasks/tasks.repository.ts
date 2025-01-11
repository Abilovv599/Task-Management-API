import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Task } from './entities/task.entity';
import { TASK_STATUS } from './enums/task-status.enum';
import type { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import type { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly dataSource: DataSource) {}

  private readonly repository = this.dataSource.getRepository(Task);

  // public getTasks(filterDto: GetFilteredTasksDto) {
  //   const { status, search } = filterDto;
  //
  //   const where: any = {};
  //
  //   if (status) {
  //     where.status = status;
  //   }
  //
  //   if (search) {
  //     where.title = Like(`%${search}%`);
  //     where.description = Like(`%${search}%`);
  //   }
  //
  //   return this.repository.find({
  //     where,
  //   });
  // }

  public getTasks(filterDto: GetFilteredTasksDto) {
    const { status, search } = filterDto;

    const query = this.repository.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    return query.getMany();
  }

  public async getTaskById(id: string) {
    const isTaskExists = await this.repository.existsBy({ id });

    if (!isTaskExists) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return this.repository.findOneBy({ id });
  }

  public createTask(createTaskDto: CreateTaskDto) {
    const newTask = this.repository.create(createTaskDto);

    return this.repository.save(newTask);
  }

  public async deleteTask(id: string) {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  public async updateTaskStatus(id: string, status: TASK_STATUS) {
    const task = await this.getTaskById(id);

    task.status = status;

    return this.repository.save(task);
  }
}
