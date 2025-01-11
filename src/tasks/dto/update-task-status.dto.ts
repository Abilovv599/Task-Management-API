import { IsEnum } from 'class-validator';
import { TASK_STATUS } from '../enums/task-status.enum';
import { PickType } from '@nestjs/mapped-types';
import { Task } from '../entities/task.entity';

export class UpdateTaskStatusDto extends PickType(Task, ['status']) {
  @IsEnum(TASK_STATUS)
  status: TASK_STATUS;
}
