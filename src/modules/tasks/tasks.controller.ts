import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationDto } from '~/common/dtos/pagination.dto';
import { Task } from '~/common/entities/task.entity';
import { User } from '~/common/entities/user.entity';
import { PaginatedList } from '~/common/models/paginated-list.model';
import { CurrentUser } from '~/decorators/current-user.decorator';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

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
