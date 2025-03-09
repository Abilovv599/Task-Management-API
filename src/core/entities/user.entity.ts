import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Task } from '~/core/entities/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ default: false })
  isOAuthUser: boolean;

  @OneToMany(() => Task, (task) => task.user, { eager: true })
  tasks: Task[];
}
