import { Injectable } from '@nestjs/common';



import { DataSource, Repository } from 'typeorm';



import { PaginationService } from '~/modules/common/services/pagination.service';



import { PaginationDto } from '~/common/dtos/pagination.dto';
import { User } from '~/common/entities/user.entity';
import { PaginatedList } from '~/common/models/paginated-list.model';





@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    readonly dataSource: DataSource,
    private paginationService: PaginationService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  public getUsers(paginationDto: PaginationDto): Promise<PaginatedList<User>> {
    const { page = 1, limit = 10 } = paginationDto;

    const query = this.createQueryBuilder('users');

    return this.paginationService.paginate<User>(query, page, limit);
  }
}
