import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from '../users/users.service';
import { ClientProfilesService } from '../client-profiles/client-profiles.service';
import {GetProjectsFilterDto} from "./dto/get-projects-filter.dto";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private readonly usersService: UsersService,
    private readonly clientProfilesService: ClientProfilesService,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
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

  async findPaginated(filterDto: GetProjectsFilterDto) {
    const page = Number(filterDto.page) || 1;
    const limit = Number(filterDto.limit) || 6;
    const skip = (page - 1) * limit;
    const { status, search } = filterDto;

    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.manager', 'manager')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(task.id)', 'count')
          .from('tasks', 'task')
          .where('task.project_id = project.id');
      }, 'project_tasksCount');

    if (status && status !== 'all') {
      query.andWhere('project.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(project.name) LIKE LOWER(:search) OR LOWER(client.companyName) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    query.orderBy('project.createdAt', 'DESC');

    const [projects, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();


    const mappedData = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      date: project.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      client: project.client ? {
        id: project.client.id,
        companyName: project.client.companyName,
      } : null,
      manager: project.manager ? {
        id: project.manager.id,
        fullName: `${project.manager.firstName} ${project.manager.lastName}`.trim(),
      } : null,
      tasksCount: Number((project as any).tasksCount) || 0,
    }));

    return {
      data: mappedData,
      meta: {
        totalItems,
        itemCount: mappedData.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
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
      },
    });
    if (!project) {
      throw new NotFoundException(`Project with id: ${id} not found `);
    }
    return project;
  }
}
