import { IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { Task } from '../entities/task.entity';

export class CreateTaskDto extends PickType(Task, ['title', 'description']) {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
