import {Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {RoleEntity} from "./role.entity";
import {Repository} from "typeorm";

@Injectable()
export class RolesService implements OnModuleInit {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly rolesRepository: Repository<RoleEntity>,
    ) {}
    async onModuleInit() {
        await this.seedRoles();
    }

    private async seedRoles() {
        const roles = ['admin', 'client', 'developer', 'manager'];
        for (const roleName of roles) {
            const roleExists = await this.rolesRepository.findOne({ where: { name: roleName } });

            if (!roleExists) {
                const newRole = this.rolesRepository.create({ name: roleName });
                await this.rolesRepository.save(newRole);
                console.log(`Seeded role: ${roleName}`);
            }
        }
    }

    async findByName(name: string): Promise<RoleEntity> {
        const foundName = await this.rolesRepository.findOne({ where: { name } });
        if (!foundName) {
            throw new NotFoundException('Name was not found');
        }
        return foundName;
    }
}
