import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProfileEntity } from './client-profile.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientsFilterDto } from './dto/get-clients-filter.dto';
import { ClientStatus } from './enums/client-status.enum';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/user.entity';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ClientProfilesService {
  constructor(
    @InjectRepository(ClientProfileEntity)
    private readonly clientProfileRepository: Repository<ClientProfileEntity>,

    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateClientDto): Promise<ClientProfileEntity> {
    const email = dto.contactEmail;

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const newClientProfile = transactionalEntityManager.create(
          ClientProfileEntity,
          {
            companyName: dto.companyName,
            contractValue: dto.contractValue || 0,
            contactPerson: dto.contactPerson,
            contactEmail: email,
            phone: dto.phone,
            status: dto.status || ClientStatus.LEAD,
          },
        );

        const savedClient = await transactionalEntityManager.save(
          ClientProfileEntity,
          newClientProfile,
        );

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
          const attachedCompanyId = existingUser.client?.id;

          if (!attachedCompanyId) {
            existingUser.client = { id: savedClient.id } as ClientProfileEntity;
            await transactionalEntityManager.save(UserEntity, existingUser);

            console.log(
              `[CRM] Current user ${email} successfully attached to new company.`,
            );
          } else if (attachedCompanyId !== savedClient.id) {
            throw new ConflictException(
              `User with email ${email} is already attached to another company.`,
            );
          }
        } else {
          const temporaryPassword = Math.random().toString(36).slice(-8);
          const nameParts = dto.contactPerson.split(' ');
          const firstName = nameParts[0] || 'Client';
          const lastName = nameParts[1] || 'Contact';

          const createUserDto: CreateUserDto = {
            email: email,
            passwordHash: temporaryPassword,
            firstName,
            lastName,
            roleName: 'client',
            companyId: savedClient.id,
          };

          await this.usersService.createUser(
            createUserDto,
            transactionalEntityManager,
          );
          console.log(
            `[CRM] Created user on the fly. Temporary password: ${temporaryPassword}`,
          );
        }
        return savedClient;
      },
    );
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientProfileEntity> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const client = await transactionalEntityManager.findOne(
          ClientProfileEntity,
          {
            where: { id },
            relations: {
              users: true,
            },
          },
        );

        if (!client) {
          throw new NotFoundException(`Client with ID ${id} not found`);
        }

        const oldEmail = client.contactEmail.toLowerCase().trim();
        const newEmail = dto.contactEmail
          ? dto.contactEmail.toLowerCase().trim()
          : oldEmail;

        if (dto.companyName) client.companyName = dto.companyName;
        if (dto.contactPerson) client.contactPerson = dto.contactPerson;
        if (dto.phone) client.phone = dto.phone;
        if (dto.status) client.status = dto.status;
        if (dto.contractValue !== undefined)
          client.contractValue = Number(dto.contractValue);

        if (newEmail !== oldEmail) {
          client.contactEmail = newEmail;

          const existingUser = await this.usersService.findByEmail(newEmail);

          if (existingUser) {
            const attachedCompanyId = existingUser.client?.id;

            if (!attachedCompanyId) {
              existingUser.client = { id: client.id } as ClientProfileEntity;
              await transactionalEntityManager.save(existingUser);
            } else if (attachedCompanyId !== client.id) {
              throw new ConflictException(
                `User with email ${newEmail} is already attached to another company`,
              );
            }
          } else {
            const temporaryPassword = Math.random().toString(36).slice(-8);
            const nameParts = (dto.contactPerson || client.contactPerson).split(
              ' ',
            );
            const firstName = nameParts[0] || 'Client';
            const lastName = nameParts[1] || 'Contact';

            const createUserDto: CreateUserDto = {
              email: newEmail,
              passwordHash: temporaryPassword,
              firstName,
              lastName,
              roleName: 'client',
              companyId: client.id,
            };

            await this.usersService.createUser(
              createUserDto,
              transactionalEntityManager,
            );
            console.log(
              `[CRM Update] Created new user on-the-fly for ${newEmail}`,
            );
          }
        }

        return await transactionalEntityManager.save(
          ClientProfileEntity,
          client,
        );
      },
    );
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
    const { search, statuses } = filterDto;
    const skip = (page - 1) * limit;

    const query = this.clientProfileRepository.createQueryBuilder('client');

    const activeMetricsQuery = this.clientProfileRepository
      .createQueryBuilder('client')
      .where('client.status = :status', { status: ClientStatus.ACTIVE });

    const leadsMetricsQuery = this.clientProfileRepository
      .createQueryBuilder('client')
      .where('client.status = :status', { status: ClientStatus.LEAD });

    const archivedMetricsQuery = this.clientProfileRepository
      .createQueryBuilder('client')
      .where('client.status = :status', { status: ClientStatus.ARCHIVED });

    if (statuses && statuses.length > 0) {
      query.andWhere('client.status IN (:...statuses)', { statuses });
    }

    if (search) {
      const searchFilter =
        '(LOWER(client.companyName) LIKE LOWER(:search) OR LOWER(client.contactPerson) LIKE LOWER(:search) OR LOWER(client.contactEmail) LIKE LOWER(:search))';
      const searchParam = { search: `%${search}%` };

      activeMetricsQuery.andWhere(searchFilter, searchParam);
      leadsMetricsQuery.andWhere(searchFilter, searchParam);
      archivedMetricsQuery.andWhere(searchFilter, searchParam);
      query.andWhere(searchFilter, searchParam);
    }

    const [activeCount, leadsCount, archivedCount] = await Promise.all([
      activeMetricsQuery.getCount(),
      leadsMetricsQuery.getCount(),
      archivedMetricsQuery.getCount(),
    ]);

    const [globalActive, globalLeads, globalArchived] = await Promise.all([
      this.clientProfileRepository.count({
        where: { status: ClientStatus.ACTIVE },
      }),
      this.clientProfileRepository.count({
        where: { status: ClientStatus.LEAD },
      }),
      this.clientProfileRepository.count({
        where: { status: ClientStatus.ARCHIVED },
      }),
    ]);

    const totalActiveRevenueResult = (await this.clientProfileRepository
      .createQueryBuilder('client')
      .select('SUM(client.contractValue)', 'sum')
      .where('client.status = :status', { status: ClientStatus.ACTIVE })
      .getRawOne()) as unknown as { sum: string | null } | undefined;
    const totalActiveRevenue = Number(totalActiveRevenueResult?.sum) || 0;

    query.orderBy('client.createdAt', 'DESC');

    const [clients, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const mappedData = clients.map((client) => ({
      id: client.id,
      companyName: client.companyName,
      date: client.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
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

        filteredMetrics: {
          activeCount,
          leadsCount,
          archivedCount,
          totalCount: activeCount + leadsCount + archivedCount,
        },

        globalMetrics: {
          activeCount: globalActive,
          leadsCount: globalLeads,
          archivedCount: globalArchived,
          totalGlobal: globalActive + globalLeads + globalArchived,
          totalActiveRevenue,
        },
      },
    };
  }

  async findOne(id: string): Promise<ClientProfileEntity> {
    const client = await this.clientProfileRepository.findOne({
      where: { id },
      relations: {
        users: true,
        projects: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
  ): Promise<ClientProfileEntity> {
    const { status } = dto;
    const client = await this.findOne(id);
    client.status = status;
    return this.clientProfileRepository.save(client);
  }
}
