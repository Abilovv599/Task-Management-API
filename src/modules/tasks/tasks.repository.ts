import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Task } from '~/common/entities/task.entity';
import type { User } from '~/common/entities/user.entity';

import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(readonly dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  public getTasks(filterDto: GetFilteredTasksDto, user?: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('tasks');

    if (user) {
      query.where({ user });
      // query.where('tasks.userId = :userId', { userId: user.id });
    }

    if (status) {
      query.andWhere('tasks.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(tasks.title) LIKE LOWER(:search) OR LOWER(tasks.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    return query.getMany();
  }

  // public async getTasks(filterDto: GetFilteredTasksDto) {
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
  //   return this.find({ where });
  // }

  public async deleteTask(id: string, user: User): Promise<number> {
    const result = await this.delete({ id, user });

    return result.affected ?? 0;
  }
}
