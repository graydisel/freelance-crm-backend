import { Body, Controller, Param, Patch, Post, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import * as tasksModel from '../models/tasks.model';

@Controller('tasks')
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Post()
  createTask(
    @Body('projectId') projectId: string,
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    return this.taskService.createTask(projectId, title, description);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: tasksModel.TaskStatus,
  ) {
    return this.taskService.updateTaskStatus(id, newStatus);
  }

  @Put(':id')
  updateTask(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    return this.taskService.updateTask(id, title, description);
  }
}
