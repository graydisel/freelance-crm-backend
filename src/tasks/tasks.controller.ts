import {
  Body,
  Controller,
  Get,
  Logger,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permission } from 'src/roles/enums/permission.enum';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { type AuthenticatedUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('tasks')
@UseGuards(PermissionsGuard)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private tasksService: TasksService) { }

  @Post()
  @RequirePermissions(Permission.TASKS_CREATE)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: { user: { userId: string } },
  ) {
    const creatorId = req.user.userId;
    return this.tasksService.create(createTaskDto, creatorId);
  }

  @Get()
  @RequirePermissions(Permission.TASKS_READ)
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('project/:projectId')
  @RequirePermissions(Permission.TASKS_READ)
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Get('filter')
  @RequirePermissions(Permission.TASKS_READ)
  findFiltered(@Query() query: GetFilteredTasksDto) {
    return this.tasksService.findFiltered(query);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.TASKS_UPDATE)
  updateStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: TaskStatus,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(
      `PATCH tasks/${id}/status triggered with body: ${JSON.stringify({ newStatus })}`,
    );
    return this.tasksService.updateStatus(id, newStatus, user);
  }

  @Patch(':id/priority')
  @RequirePermissions(Permission.TASKS_UPDATE)
  updatePriority(
    @Param('id') id: string,
    @Body('newPriority') newPriority: TaskPriority,
  ) {
    this.logger.log(
      `PATCH tasks/${id}/priority triggered with body: ${JSON.stringify({ newPriority })}`,
    );
    return this.tasksService.updatePriority(id, newPriority);
  }

  @Patch(':id')
  @RequirePermissions(Permission.TASKS_UPDATE)
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.TASKS_DELETE)
  removeTask(@Param('id') id: string) {
    this.logger.log(`DELETE tasks/${id} triggered`);
    return this.tasksService.remove(id);
  }
}
