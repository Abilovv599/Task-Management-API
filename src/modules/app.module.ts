import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, HealthModule, CommonModule, UsersModule, AuthModule, TasksModule],
})
export class AppModule {}
