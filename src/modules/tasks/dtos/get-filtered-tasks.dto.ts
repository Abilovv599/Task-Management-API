import { IsEnum, IsOptional, IsString } from 'class-validator';

import { TaskStatus } from '~/modules/tasks/enums/task-status.enum';

export class GetFilteredTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
