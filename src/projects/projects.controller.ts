import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}
  @Get()
  getAllProjects() {
    return this.projectsService.findAll();
  }

  @Post()
  createProject(
    @Body('name') name: string,
    @Body('clientName') clientName: string,
    @Body('budget') budget: number,
  ) {
    return this.projectsService.create(name, clientName, budget);
  }
}
