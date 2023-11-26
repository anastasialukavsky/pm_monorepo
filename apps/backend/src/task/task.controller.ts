import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { GetUser } from 'src/auth/decorators';
import { CreateTaskDto, EditTaskDto } from './dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get(':id')
  getTasks(@GetUser('id') projectId: number) {
    return this.taskService.getTasks(projectId);
  }

  @Get(':id')
  getTasksById(
    @GetUser('id') projectId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.getTaskById(projectId, taskId);
  }

  @Post()
  createTask(@GetUser('id') projectId: number, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(projectId, dto);
  }

  @Patch(':id')
  editTaskById(
    @GetUser('id') projectId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: EditTaskDto,
  ) {
    return this.taskService.editTaskById(projectId, taskId, dto);
  }

  @Delete('id')
  deleteTaskById(
    @GetUser('id') projectId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.deleteTaskById(projectId, taskId);
  }
}
