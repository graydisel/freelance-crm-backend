import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TaskEntity} from "./task.entity";
import {ProjectEntity} from "../projects/project.entity";
import {Repository} from "typeorm";
import {TaskStatus} from "../models/taks.model";

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskRepository: Repository<TaskEntity>,
        @InjectRepository(ProjectEntity)
        private readonly projectRepository: Repository<ProjectEntity>,
    ) {}
    async createTask(projectId: string, title: string, description: string): Promise<TaskEntity> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
            throw new NotFoundException(`Project with id ${projectId} not found`);
        }

        const newTask = this.taskRepository.create({
            title,
            description,
            status: 'todo',
            project
        });

        return this.taskRepository.save(newTask);
    }

    async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<TaskEntity> {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException(`Project with id ${taskId} not found`);
        }
        task.status = newStatus;
        return this.taskRepository.save(task);
    }
}
