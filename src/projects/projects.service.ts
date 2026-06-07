import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

  async findAll(): Promise<ProjectEntity[]> {
    return this.projectRepository.find({
      relations: {
        tasks: true,
      },
    });
  }

  async create(
    name: string,
    clientName: string,
    budget: number,
  ): Promise<ProjectEntity> {
    const newProject = this.projectRepository.create({
      name,
      clientName,
      budget,
    });
    return this.projectRepository.save(newProject);
  }
}
