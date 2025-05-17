import { Injectable } from '@nestjs/common';



import { DataSource, Repository } from 'typeorm';



import { User } from '~/common/entities/user.entity';





@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
}
