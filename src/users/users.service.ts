import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./user.entity";
import {Repository} from "typeorm";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private readonly rolesService: RolesService,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const validEmail = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (validEmail) {
            throw new BadRequestException("This email already exists");
        }

        const validRole = await this.rolesService.findByName(createUserDto.roleName);
        if (!validRole) {
            throw new BadRequestException(`Role '${createUserDto.roleName}' not found`);
        }

        const newUser = this.userRepository.create({
            email: createUserDto.email,
            passwordHash: createUserDto.passwordHash,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            role: validRole,
        })
        return this.userRepository.save(newUser);
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepository.find({ relations: {
                role: true,
                client: true,
            },
        });
    }
}
