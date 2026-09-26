import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { GetFilteredTasksDto } from './dto/get-filtered-tasks.dto';
import { STATUS_TRANSITIONS } from './constants/status-transitions';
import { RolesEnum } from 'src/roles/enums/roles.enum';

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

    const saved = await this.taskRepository.save(newTask);
    return this.findOne(saved.id);
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      relations: {
        project: true,
        creator: { profile: true },
        assignee: { profile: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findFiltered(dto: GetFilteredTasksDto) {
    const { priority, assigneeId, projectId } = dto;

    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('assignee.profile', 'assigneeProfile')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.project_id = :projectId', { projectId });

    if (priority && priority !== 'all') {
      query.andWhere('task.priority = :priority', { priority });
    }

    if (assigneeId) {
      query.andWhere('task.assignee_id = :assigneeId', { assigneeId });
    }

    query.orderBy('task.createdAt', 'DESC');

    const tasks = await query.getMany();

    return tasks;
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        project: true,
        assignee: { profile: true },
        creator: { profile: true },
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
      relations: {
        assignee: { profile: true },
        creator: { profile: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    taskId: string,
    newStatus: TaskStatus,
    currentUser: UserEntity,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { assignee: { profile: true } },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    const userRole = currentUser.role?.name as RolesEnum;
    const allowedStatuses = STATUS_TRANSITIONS[userRole] ?? [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new ForbiddenException(
        `User with role ${userRole} cannot change task status to ${newStatus}`,
      );
    }

    if (
      userRole === RolesEnum.DEVELOPER &&
      task.assignee?.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        `Developer is not allowed to change status of unassigned task`,
      );
    }

    task.status = newStatus;
    await this.taskRepository.save(task);
    return this.findOne(taskId);
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
    await this.taskRepository.save(task);
    return this.findOne(taskId);
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(taskId);

    if (dto.title && dto.title !== task.title) task.title = dto.title;
    if (dto.description !== undefined && dto.description !== task.description)
      task.description = dto.description;

    if (dto.assigneeId !== undefined) {
      if (dto.assigneeId) {
        if (dto.assigneeId !== task.assignee?.id) {
          task.assignee = await this.usersService.findOne(dto.assigneeId);
        }
      } else {
        task.assignee = null;
      }
    }

    if (dto.status && dto.status !== task.status) task.status = dto.status;
    if (dto.priority && dto.priority !== task.priority)
      task.priority = dto.priority;

    await this.taskRepository.save(task);
    return this.findOne(taskId);
  }

  async remove(taskId: string): Promise<void> {
    const task = await this.findOne(taskId);
    await this.taskRepository.remove(task);
  }
}
