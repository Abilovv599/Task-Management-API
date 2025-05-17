import { IsEnum } from 'class-validator';

import { TASK_STATUS } from '~/common/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @IsEnum(TASK_STATUS)
  status: TASK_STATUS;
}
