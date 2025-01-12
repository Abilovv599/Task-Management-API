import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TASK_STATUS } from '../enums/task-status.enum';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: TASK_STATUS.OPEN })
  status: TASK_STATUS;
}
