import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TASK_STATUS } from '../enums/task-status.enum';

export class GetFilteredTasksDto {
  @IsOptional()
  @IsEnum(TASK_STATUS)
  status?: TASK_STATUS;

  @IsOptional()
  @IsString()
  search?: string;
}
