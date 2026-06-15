import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {CreateProjectDto} from "./dto/create-project.dto";
import {AuthGuard} from "@nestjs/passport";
import {Roles} from "../auth/decorators/roles.decorator";
import {RolesGuard} from "../auth/guards/roles.guard";

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}
  @Get()
  getAllProjects() {
    return this.projectsService.findAll();
  }

  @Post()
  @Roles('admin', 'manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  createProject(
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(createProjectDto);
  }


}
