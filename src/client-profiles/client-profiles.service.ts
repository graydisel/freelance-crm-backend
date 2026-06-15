import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProfileEntity } from './client-profile.entity';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientStatus } from './enums/client-status.enum';

@Injectable()
export class ClientProfilesService {
  constructor(
    @InjectRepository(ClientProfileEntity)
    private readonly clientProfileRepository: Repository<ClientProfileEntity>,
  ) {}

  async create(dto: CreateClientDto): Promise<ClientProfileEntity> {
    const newClientProfile = this.clientProfileRepository.create({
      companyName: dto.companyName,
      contractValue: dto.contractValue || 0,
      phone: dto.phone,
      status: dto.status,
    });
    return this.clientProfileRepository.save(newClientProfile);
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientProfileEntity> {
    const client = await this.findOne(id);

    if (dto.companyName) client.companyName = dto.companyName;
    if (dto.contractValue) client.contractValue = dto.contractValue;
    if (dto.phone) client.phone = dto.phone;
    if (dto.status) client.status = dto.status;

    return this.clientProfileRepository.save(client);
  }

  async getDashboardStats() {
    const totalActive = await this.clientProfileRepository.count({
      where: { status: ClientStatus.ACTIVE },
    });

    const totalLeads = await this.clientProfileRepository.count({
      where: { status: ClientStatus.LEAD },
    });

    const totalArchived = await this.clientProfileRepository.count({
      where: { status: ClientStatus.INACTIVE },
    });

    const activeClients = await this.clientProfileRepository.find({
      where: { status: ClientStatus.ACTIVE },
    });

    const totalRevenue = activeClients.reduce(
      (sum, client) => sum + client.contractValue,
      0,
    );

    return {
      activeClientsCount: totalActive,
      leadsCount: totalLeads,
      archivedClientsCount: totalArchived,
      totalRevenue: totalRevenue,
    };
  }

  async findAll(): Promise<ClientProfileEntity[]> {
    return this.clientProfileRepository.find({
      relations: { users: true },
    });
  }

  async findOne(id: string): Promise<ClientProfileEntity> {
    const company = await this.clientProfileRepository.findOne({
      where: { id },
      relations: { users: true, projects: true },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }
}
