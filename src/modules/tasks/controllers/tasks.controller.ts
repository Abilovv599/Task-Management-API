import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateTaskDto } from '~/modules/tasks/dtos/create-task.dto';
import { GetFilteredTasksDto } from '~/modules/tasks/dtos/get-filtered-tasks.dto';
import { UpdateTaskStatusDto } from '~/modules/tasks/dtos/update-task-status.dto';
import { Task } from '~/modules/tasks/entity/task.entity';
import { User } from '~/modules/users/entity/user.entity';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { PaginatedList } from '~/common/models/paginated-list.model';
import { CurrentUser } from '~/decorators/current-user.decorator';

import { TasksService } from '../services/tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async getTasks(
    @Query() filterDto: GetFilteredTasksDto,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedList<Task>> {
    return await this.tasksService.getTasks(filterDto, paginationDto);
  }

  @Get('user-tasks')
  public async getUsersTasks(
    @Query() filterDto: GetFilteredTasksDto,
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedList<Task>> {
    return await this.tasksService.getTasks(filterDto, paginationDto, user);
  }

  @Get('user-task/:id')
  public async getUserTaskById(@Param('id') id: string, @CurrentUser() user: User): Promise<Task> {
    return await this.tasksService.getTaskById(id, user);
  }

  @Get(':id')
  public async getTaskById(@Param('id') id: string): Promise<Task> {
    return await this.tasksService.getTaskById(id);
  }

  @Post()
  public async createTask(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User): Promise<Task> {
    return await this.tasksService.createTask(createTaskDto, user);
  }

  @Patch(':id/status')
  public async updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return await this.tasksService.updateTaskStatus(id, updateTaskStatusDto, user);
  }

  @Delete(':id')
  public async deleteTask(@Param('id') id: string, @CurrentUser() user: User): Promise<string> {
    return await this.tasksService.deleteTask(id, user);
  }
}
