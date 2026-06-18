import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ClientProfileEntity} from "../client-profiles/client-profile.entity";
import {Repository} from "typeorm";
import {ClientStatus} from "../client-profiles/enums/client-status.enum";
import {TaskStatus} from "../tasks/enums/task-status.enum";
import {ProjectStatus} from "../projects/enums/project-status.enum";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ClientProfileEntity)
    private readonly clientProfileRepository: Repository<ClientProfileEntity>,
  ) {}

  async getDashboardStats() {
    const totalActive = await this.clientProfileRepository.count({
      where: { status: ClientStatus.ACTIVE },
    });

    const totalLeads = await this.clientProfileRepository.count({
      where: { status: ClientStatus.LEAD },
    });

    const totalArchived = await this.clientProfileRepository.count({
      where: { status: ClientStatus.ARCHIVED },
    });

    const activeClients = await this.clientProfileRepository.find({
      where: { status: ClientStatus.ACTIVE },
    });

    const recentClients = await this.clientProfileRepository.find({
      order: { createdAt: 'ASC' },
      take: 5,
    });

    const totalRevenue = activeClients.reduce(
      (sum, client) => sum + client.contractValue,
      0,
    );

    const projectRepository = this.clientProfileRepository.manager.getRepository('ProjectEntity');
    const projects = await projectRepository.find({
      relations: { client: true, tasks: true }
    });

    const tasksRepository = this.clientProfileRepository.manager.getRepository('TaskEntity');
    const totalTasksCount = await tasksRepository.count();
    const completedTasksCount = await tasksRepository.count({ where: { status: TaskStatus.DONE } });

    const projectsPlanning = projects.filter(p => p.status === ProjectStatus.PLANNING).length;
    const projectsActive = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
    const projectsDone = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;

    const topProjects = projects.map(p => ({
      name: p.name,
      client: p.client?.companyName || 'Unknown Client',
      completedTasks: p.tasks ? p.tasks.filter(t => t.status === TaskStatus.DONE).length : 0,
      totalTasks: p.tasks ? p.tasks.length : 0
    }));

    return {
      activeClientsCount: totalActive,
      leadsCount: totalLeads,
      archivedClientsCount: totalArchived,
      totalRevenue: totalRevenue,
      projectsPlanning,
      projectsActive,
      projectsDone,
      tasksCompleted: completedTasksCount,
      tasksTotal: totalTasksCount,
      recentClients: recentClients.map(c => ({
        companyName: c.companyName,
        contractValue: c.contractValue,
        phone: c.phone,
        status: c.status
      })),
      topProjects: topProjects.slice(0, 3)
    };
  }
}
