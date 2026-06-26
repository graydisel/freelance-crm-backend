import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProfileEntity } from './client-profile.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientsFilterDto } from "./dto/get-clients-filter.dto";
import { ClientStatus } from "./enums/client-status.enum";
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/user.entity';

@Injectable()
export class ClientProfilesService {
  constructor(
    @InjectRepository(ClientProfileEntity)
    private readonly clientProfileRepository: Repository<ClientProfileEntity>,

    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateClientDto): Promise<ClientProfileEntity> {
    const emailNormalized = dto.contactEmail.toLowerCase().trim();

    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const newClientProfile = transactionalEntityManager.create(ClientProfileEntity, {
        companyName: dto.companyName,
        contractValue: dto.contractValue || 0,
        contactPerson: dto.contactPerson,
        contactEmail: emailNormalized,
        phone: dto.phone,
        status: dto.status || ClientStatus.LEAD,
      });

      const savedClient = await transactionalEntityManager.save(ClientProfileEntity, newClientProfile);

      const existingUser = await this.usersService.findByEmail(emailNormalized);

      if (existingUser) {
        const attachedCompanyId = existingUser.client?.id;

        if (!attachedCompanyId) {

          existingUser.client = { id: savedClient.id } as ClientProfileEntity;
          await transactionalEntityManager.save(UserEntity, existingUser);

          console.log(`[CRM] Current user ${emailNormalized} successfully attached to new company.`);

        } else if (attachedCompanyId !== savedClient.id) {
          throw new ConflictException(
            `User with email ${emailNormalized} is already attached to another company.`
          );
        }

      } else {
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const nameParts = dto.contactPerson.split(' ');
        const firstName = nameParts[0] || 'Client';
        const lastName = nameParts[1] || 'Contact';

        const createUserDto: CreateUserDto = {
          email: emailNormalized,
          passwordHash: temporaryPassword,
          firstName,
          lastName,
          roleName: 'client',
          companyId: savedClient.id,
        };

        await this.usersService.createUser(createUserDto, transactionalEntityManager);
        console.log(`[CRM] Created user on the fly. Temporary password: ${temporaryPassword}`);
      }
      return savedClient;
    });
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientProfileEntity> {
    const client = await this.findOne(id);

    if (dto.companyName) client.companyName = dto.companyName;
    if (dto.contractValue) client.contractValue = dto.contractValue;
    if (dto.contactPerson) client.contactPerson = dto.contactPerson;
    if (dto.contactEmail) client.contactEmail = dto.contactEmail.toLowerCase().trim();
    if (dto.phone) client.phone = dto.phone;
    if (dto.status) client.status = dto.status;

    return this.clientProfileRepository.save(client);
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

  private getInitials(text: string): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  }

  async findPaginated(filterDto: GetClientsFilterDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const { search, status } = filterDto;
    const skip = (page - 1) * limit;


    const metricsRaw = await this.clientProfileRepository
      .createQueryBuilder('client')
      .select('client.status', 'status')
      .addSelect('COUNT(client.id)', 'count')
      .addSelect('SUM(client.contract_value)', 'totalRevenue')
      .groupBy('client.status')
      .getRawMany();

    let activeCount = 0;
    let leadsCount = 0;
    let archivedCount = 0;
    let totalActiveRevenue = 0;

    metricsRaw.forEach(row => {
      const count = parseInt(row.count, 10) || 0;
      if (row.status === ClientStatus.ACTIVE) {
        activeCount = count;
        totalActiveRevenue = parseFloat(row.totalRevenue) || 0;
      } else if (row.status === ClientStatus.LEAD) {
        leadsCount = count;
      } else if (row.status === ClientStatus.ARCHIVED) {
        archivedCount = count;
      }
    });

    const query = this.clientProfileRepository.createQueryBuilder('client');

    if (status && status !== 'all') {
      query.andWhere('client.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(client.companyName) LIKE LOWER(:search) OR LOWER(client.contactPerson) LIKE LOWER(:search) OR LOWER(client.contactEmail) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    query.orderBy('client.createdAt', 'DESC');

    const [clients, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const mappedData = clients.map(client => ({
      id: client.id,
      companyName: client.companyName,
      date: client.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      contactPerson: client.contactPerson,
      contactEmail: client.contactEmail,
      phone: client.phone || '—',
      contractValue: client.contractValue ? Number(client.contractValue) : null,
      status: client.status,
      initialsCompany: this.getInitials(client.companyName),
      initialsContact: this.getInitials(client.contactPerson),
    }));

    return {
      data: mappedData,
      meta: {
        totalItems,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalItems / limit),
        metrics: {
          activeCount,
          leadsCount,
          archivedCount,
          totalActiveRevenue,
        }
      },
    };
  }
}
