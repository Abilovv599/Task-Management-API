import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '~/modules/common/guards/roles.guard';
import { User } from '~/modules/users/entity/user.entity';

import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repository/users.repository';
import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [UsersService], // Export if needed by other modules
})
export class UsersModule {}
