import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../users/users.service';
import { ClientProfilesService } from '../client-profiles/client-profiles.service';
import { GetProjectsFilterDto } from './dto/get-projects-filter.dto';
import { ProjectStatus } from './enums/project-status.enum';
import { UserProfilesService } from 'src/user-profiles/user-profiles.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private readonly usersService: UsersService,
    private readonly userProfileService: UserProfilesService,
    private readonly clientProfilesService: ClientProfilesService,
  ) { }

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
      .leftJoinAndSelect('project.tasks', 'tasks');

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

    const createMetricsQuery = (statusValue: ProjectStatus) => {
      const qb = this.projectRepository
        .createQueryBuilder('project')
        .leftJoin('project.client', 'client')
        .where('project.status = :statusValue', { statusValue });

      if (search) {
        qb.andWhere(
          '(LOWER(project.name) LIKE LOWER(:search) OR LOWER(client.companyName) LIKE LOWER(:search))',
          { search: `%${search}%` },
        );
      }
      return qb;
    };

    const planningMetricsQuery = createMetricsQuery(ProjectStatus.PLANNING);
    const activeMetricsQuery = createMetricsQuery(ProjectStatus.ACTIVE);
    const reviewMetricsQuery = createMetricsQuery(ProjectStatus.REVIEW);
    const completedMetricsQuery = createMetricsQuery(ProjectStatus.COMPLETED);
    const pausedMetricsQuery = createMetricsQuery(ProjectStatus.PAUSED);

    const [
      planningCount,
      activeCount,
      reviewCount,
      completedCount,
      pausedCount,
    ] = await Promise.all([
      planningMetricsQuery.getCount(),
      activeMetricsQuery.getCount(),
      reviewMetricsQuery.getCount(),
      completedMetricsQuery.getCount(),
      pausedMetricsQuery.getCount(),
    ]);

    const totalCount =
      planningCount + activeCount + reviewCount + completedCount + pausedCount;

    const mappedData = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      date: project.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      client: project.client
        ? {
          id: project.client.id,
          companyName: project.client.companyName,
        }
        : null,
      manager: project.manager
        ? {
          id: project.manager.id,
          fullName:
            `${project.manager.firstName} ${project.manager.lastName}`.trim(),
        }
        : null,
      tasksCount: project.tasks ? project.tasks.length : 0,
    }));

    return {
      data: mappedData,
      meta: {
        totalItems,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        filteredMetrics: {
          planningCount,
          activeCount,
          reviewCount,
          completedCount,
          pausedCount,
          totalCount,
        },
      },
    };
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectEntity> {
    const project = await this.findOne(id);

    if (dto.name !== undefined) {
      project.name = dto.name;
    }
    if (dto.description !== undefined) {
      project.description = dto.description;
    }
    if (dto.status !== undefined) {
      project.status = dto.status;
    }
    if (dto.clientId) {
      project.client = await this.clientProfilesService.findOne(dto.clientId);
    }
    if (dto.managerId) {
      project.manager = await this.userProfileService.getProfileByUserId(dto.managerId);
    }

    return this.projectRepository.save(project);
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({
      where: { id }
    });
    if (!project) {
      throw new NotFoundException(`Project with id: ${id} not found `);
    }
    project.status = status;
    return this.projectRepository.save(project);
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

  async getProjectDetails(id: string) {
    const project = await this.findOne(id);
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      date: project.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      client: project.client
        ? {
          id: project.client.id,
          companyName: project.client.companyName,
        }
        : null,
      manager: project.manager
        ? {
          id: project.manager.id,
          fullName:
            `${project.manager.firstName} ${project.manager.lastName}`.trim(),
        }
        : null,
      tasksCount: project.tasks ? project.tasks.length : 0,
    };
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.findOne(id);
    if (project.tasks && project.tasks.length > 0) {
      throw new BadRequestException(
        'Cannot delete a project that has linked tasks.',
      );
    }
    await this.projectRepository.remove(project);
  }
}
