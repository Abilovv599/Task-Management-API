import { IsEnum } from 'class-validator';

import { TASK_STATUS } from '~/core/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TASK_STATUS)
  status: TASK_STATUS;
}
