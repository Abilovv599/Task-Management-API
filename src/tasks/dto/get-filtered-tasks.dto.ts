import { Optional } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { TASK_STATUS } from '../enums/task-status.enum';

export class GetFilteredTasksDto {
  @Optional()
  @IsEnum(TASK_STATUS)
  status?: TASK_STATUS;

  @Optional()
  search?: string;
}
