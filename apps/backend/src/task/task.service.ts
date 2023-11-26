import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, EditTaskDto } from './dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks(projectId: number) {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
      },
    });

    return tasks;
  }

  async getTaskById(projectId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
        projectId,
      },
    });
    if (!task || task.projectId !== projectId)
      throw new ForbiddenException(
        `Access denied; Invalid user credentials or task with ID ${taskId} does not exist`,
      );

    return task;
  }

  async createTask(projectId: number, dto: CreateTaskDto) {
    const taskToCreate = await this.prisma.task.create({
      data: {
        projectId,
        ...dto,
      },
    });

    return taskToCreate;
  }

  async editTaskById(projectId: number, taskId: number, dto: EditTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
        ...dto,
      },
    });

    if (!task || task.projectId !== projectId)
      throw new ForbiddenException(
        `Access denied: Invalid user credentials or task with ID ${taskId} does not exist`,
      );

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteTaskById(projectId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task || task.projectId !== projectId)
      throw new ForbiddenException(
        `Access denied; Invalid user credentials or task with ID ${taskId} does not exist`,
      );

    return await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }
}
