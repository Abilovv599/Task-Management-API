import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Task } from '~/common/entities/task.entity';
import { Role } from '~/common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

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
