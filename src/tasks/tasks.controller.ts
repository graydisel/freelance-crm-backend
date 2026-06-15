import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    const creatorId = req.user.userId;
    return this.tasksService.create(createTaskDto, creatorId);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, newStatus);
  }

  @Patch(':id/priority')
  updatePriority(
    @Param('id') id: string,
    @Body('newPriority') newPriority: TaskPriority,
  ) {
    return this.tasksService.updatePriority(id, newPriority);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'developer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }
}
