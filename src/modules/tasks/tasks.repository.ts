import { Injectable } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(readonly dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  // public getTasks(filterDto: GetFilteredTasksDto) {
  //   const { status, search } = filterDto;
  //
  //   const query = this.createQueryBuilder('tasks');
  //
  //   if (status) {
  //     query.andWhere('tasks.status = :status', { status });
  //   }
  //
  //   if (search) {
  //     query.andWhere(
  //       'LOWER(tasks.title) LIKE LOWER(:search) OR LOWER(tasks.description) LIKE LOWER(:search)',
  //       { search: `%${search}%` },
  //     );
  //   }
  //
  //   return query.getMany();
  // }

  public async getTasks(filterDto: GetFilteredTasksDto) {
    const { status, search } = filterDto;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = Like(`%${search}%`);
      where.description = Like(`%${search}%`);
    }

    return this.find({ where });
  }

  public async deleteTask(id: string) {
    const result = await this.delete(id);
    return result.affected || 0;
  }
}
