import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetProjectsFilterDto } from "./dto/get-projects-filter.dto";

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }
  @Get()
  @Roles('admin', 'manager', 'client')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getAllFilteredProjects(@Query() filterDto: GetProjectsFilterDto) {
    return this.projectsService.findPaginated(filterDto);
  }

  @Post()
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'client')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findOne(@Param('id') id: string) {
    return this.projectsService.getProjectDetails(id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
