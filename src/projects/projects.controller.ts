import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Delete,
  Logger,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { GetProjectsFilterDto } from './dto/get-projects-filter.dto';
import { Permission } from 'src/roles/enums/permission.enum';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('projects')
@UseGuards(PermissionsGuard)
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) { }

  @Get()
  @RequirePermissions(Permission.PROJECTS_READ)
  getAllFilteredProjects(@Query() filterDto: GetProjectsFilterDto) {
    return this.projectsService.findPaginated(filterDto);
  }

  @Post()
  @RequirePermissions(Permission.PROJECTS_CREATE)
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.PROJECTS_UPDATE)
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.PROJECTS_UPDATE)
  updateStatus(
    @Param('id') id: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
  ) {
    this.logger.log(
      `PATCH /projects/${id}/status triggered with body: ${JSON.stringify(updateProjectStatusDto)}`,
    );
    return this.projectsService.updateStatus(
      id,
      updateProjectStatusDto.newStatus,
    );
  }

  @Get(':id')
  @RequirePermissions(Permission.PROJECTS_READ)
  findOne(@Param('id') id: string) {
    return this.projectsService.getProjectDetails(id);
  }

  @Delete(':id')
  @RequirePermissions(Permission.PROJECTS_DELETE)
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
