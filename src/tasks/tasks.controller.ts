import {
  Body,
  Controller,
  Get, Logger,
  Param,
  Patch,
  Post,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

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

  @Get('filter')
  findFiltered(@Query() query: GetFilteredTasksDto) {
    return this.tasksService.findFiltered(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: TaskStatus,
  ) {
    this.logger.log(`PATCH tasks/${id}/status triggered with body: ${JSON.stringify({ newStatus })}`);
    return this.tasksService.updateStatus(id, newStatus);
  }

  @Patch(':id/priority')
  updatePriority(
    @Param('id') id: string,
    @Body('newPriority') newPriority: TaskPriority,
  ) {
    this.logger.log(`PATCH tasks/${id}/priority triggered with body: ${JSON.stringify({ newPriority })}`);
    return this.tasksService.updatePriority(id, newPriority);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'developer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  removeTask(@Param('id') id: string) {
    this.logger.log(`DELETE tasks/${id} triggered`);
    return this.tasksService.remove(id);
  }
}
