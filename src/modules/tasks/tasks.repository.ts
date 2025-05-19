import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { PaginationService } from '~/modules/common/services/pagination.service';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { Task } from '~/common/entities/task.entity';
import { User } from '~/common/entities/user.entity';
import { PaginatedList } from '~/common/models/paginated-list.model';

import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(
    dataSource: DataSource,
    private readonly paginationService: PaginationService,
  ) {
    super(Task, dataSource.createEntityManager());
  }

  public getTasks(
    filterDto: GetFilteredTasksDto,
    paginationDto: PaginationDto,
    user?: User,
  ): Promise<PaginatedList<Task>> {
    const { status, search } = filterDto;
    const { page = 1, limit = 10 } = paginationDto;

    const query = this.createQueryBuilder('tasks');

    if (user) {
      query.where({ user });
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

    return this.paginationService.paginate<Task>(query, page, limit);
  }

  public async deleteTask(id: string, user: User): Promise<number> {
    const result = await this.delete({ id, user });

    return result.affected ?? 0;
  }
}
