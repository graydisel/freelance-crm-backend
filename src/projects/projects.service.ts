import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ProjectEntity} from './project.entity';
import {Repository} from 'typeorm';
import {CreateProjectDto} from "./dto/create-project.dto";
import {ProjectStatus} from "./enums/project-status.enum";
import {UsersService} from "../users/users.service";
import {ClientProfilesService} from "../client-profiles/client-profiles.service";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private readonly usersService: UsersService,
    private readonly clientProfilesService: ClientProfilesService,
  ) {}

  async create(
      dto: CreateProjectDto,
  ): Promise<ProjectEntity> {
    const client = await this.clientProfilesService.findOne(dto.clientId);

    const manager = await this.usersService.findOne(dto.managerId);

    const newProject = this.projectRepository.create({
      name: dto.name,
      description: dto.description,
      status: dto.status,
      client: client,
      manager: manager,
    });
    return this.projectRepository.save(newProject);
  }

  async findAll(): Promise<ProjectEntity[]> {
    return this.projectRepository.find({
      relations: {
        client: true,
        manager: true,
        tasks: true,
      },
    });
  }

  async findOne(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        client: true,
        manager: true,
        tasks: true,
      }
    });
    if (!project) {
      throw new NotFoundException(`Project with id: ${id} not found `);
    }
    return project;
  }
}
