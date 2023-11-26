import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { GetUser } from 'src/auth/decorators';
import { CreateProjectDto, EditProjectDto } from './dto';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  getProjects(@GetUser('id') userId: string) {
    return this.projectService.getProjects(userId);
  }

  @Get(':id')
  getProjectById(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.getProjectById(userId, projectId);
  }

  @Post()
  createProject(
    @GetUser('id') userId: string,

    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(userId, dto);
  }

  @Patch(':id')
  editProjectById(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: EditProjectDto,
  ) {
    return this.projectService.editProjectById(userId, projectId, dto);
  }

  @Delete(':id')
  deleteProjectById(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.deleteProjectById(userId, projectId);
  }
}
