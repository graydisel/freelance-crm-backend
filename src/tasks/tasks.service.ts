import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { TaskStatus } from './enums/task-status.enum';
import { UserEntity } from '../users/user.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority } from './enums/task-priority.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateTaskDto, creatorId: string): Promise<TaskEntity> {
    const project = await this.projectsService.findOne(dto.projectId);

    let assignee: UserEntity | null = null;
    if (dto.assigneeId) {
      assignee = await this.usersService.findOne(dto.assigneeId);
    }
    const creator = await this.usersService.findOne(creatorId);

    const newTask = this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      project: project,
      assignee: assignee,
      creator: creator,
    });

    return this.taskRepository.save(newTask);
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      relations: {
        project: true,
        creator: true,
        assignee: true,
      },
    });
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        project: true,
        assignee: true,
        creator: true,
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async findByProject(projectId: string): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: { assignee: true, creator: true },
    });
  }

  async updateStatus(
    taskId: string,
    newStatus: TaskStatus,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    task.status = newStatus;
    return this.taskRepository.save(task);
  }

  async updatePriority(
    taskId: string,
    newPriority: TaskPriority,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    task.priority = newPriority;
    return this.taskRepository.save(task);
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(taskId);

    if (dto.title && dto.title !== task.title) task.title = dto.title;
    if (dto.description && dto.description !== task.description) task.description = dto.description;

    if (dto.assigneeId && dto.assigneeId !== task.assignee?.id) {
      task.assignee = await this.usersService.findOne(dto.assigneeId);
    }

    if (dto.status && dto.status !== task.status) task.status = dto.status;
    if (dto.priority && dto.priority !== task.priority) task.priority = dto.priority;

    return this.taskRepository.save(task);
  }
}
