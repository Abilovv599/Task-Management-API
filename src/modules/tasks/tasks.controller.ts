import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import type { Task } from '~/core/entities/task.entity';
import type { User } from '~/core/entities/user.entity';
import { CurrentUser } from '~/decorators/current-user.decorator';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public getTasks(@Query() filterDto: GetFilteredTasksDto): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto);
  }

  @Get('user-tasks')
  public getUsersTasks(
    @Query() filterDto: GetFilteredTasksDto,
    @CurrentUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto, user);
  }

  @Get('user-task/:id')
  public getUserTaskById(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  @Get(':id')
  public getTaskById(@Param('id') id: string): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  public createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Patch(':id/status')
  public updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, updateTaskStatusDto, user);
  }

  @Delete(':id')
  public deleteTask(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }
}
