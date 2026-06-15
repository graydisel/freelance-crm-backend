import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ClientProfileEntity} from "./client-profile.entity";
import {Repository} from "typeorm";
import {CreateClientDto} from "./dto/create-client.dto";

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
        })
        return this.clientProfileRepository.save(newClientProfile);
    }

    async findAll(): Promise<ClientProfileEntity[]> {
        return this.clientProfileRepository.find({
            relations: {users: true},
        });
    }

    async findOne(id: string): Promise<ClientProfileEntity> {
        const company = await this.clientProfileRepository.findOne({
            where: { id },
            relations: {users: true, projects: true},
        })
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }
}
