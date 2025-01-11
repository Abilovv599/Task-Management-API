import { Optional } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { TASK_STATUS } from '../enums/task-status.enum';
import { PartialType } from '@nestjs/mapped-types';
import { Task } from '../entities/task.entity';

export class GetFilteredTasksDto extends PartialType(Task) {
  @Optional()
  @IsEnum(TASK_STATUS)
  status?: TASK_STATUS;

  @Optional()
  search?: string;
}
