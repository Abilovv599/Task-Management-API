import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  public async getTasks(@Query() filterDto: GetFilteredTasksDto) {
    if (Object.keys(filterDto).length) {
      return await this.tasksService.getFilteredTasks(filterDto);
    } else {
      return await this.tasksService.getAllTasks();
    }
  }

  @Get(':id')
  public async getTaskById(@Param('id') id: string) {
    return await this.tasksService.getTaskById(id);
  }

  @Post()
  public async createTask(@Body() createTaskDto: CreateTaskDto) {
    return await this.tasksService.createTask(createTaskDto);
  }
}
