import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { ClientProfileEntity } from 'src/client-profiles/client-profile.entity';
import { UserRoleEnum } from './enums/user-role.enum';
import { UserProfileEntity } from 'src/user-profiles/user-profiles.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly rolesService: RolesService,
  ) { }

  async createUser(
    createUserDto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const validEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (validEmail) {
      throw new BadRequestException('This email already exists');
    }

    const validRole = await this.rolesService.findByName(
      createUserDto.roleName,
    );
    if (!validRole) {
      throw new BadRequestException(
        `Role '${createUserDto.roleName}' not found`,
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, salt);

    const repo = manager
      ? manager.getRepository(UserEntity)
      : this.userRepository;

    const userPayload: Partial<UserEntity> = {
      email: createUserDto.email,
      passwordHash: hashedPassword,
      profile: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      } as UserProfileEntity,
      role: validRole,
    };

    if (createUserDto.companyId) {
      userPayload.client = {
        id: createUserDto.companyId,
      } as ClientProfileEntity;
    }

    const newUser = repo.create(userPayload);
    return await repo.save(newUser);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({
      relations: {
        role: true,
        client: true,
        profile: true,
      },
    });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
        client: true,
        profile: true,
      },
    });
    if (!user) {
      throw new BadRequestException(`User ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: { role: true, client: true, profile: true },
    });
  }

  async findAvailableByRole(search: string, roleName: UserRoleEnum) {
    const searchTerms = search ? search.trim() : '';

    return this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email'])
      .leftJoin('user.role', 'roleRelation')
      .leftJoin('user.client', 'clientRelation')
      .leftJoin('user.profile', 'profileRelation')
      .addSelect(['roleRelation.id', 'roleRelation.name', 'profileRelation.firstName', 'profileRelation.lastName'])
      .where('roleRelation.name = :roleName', { roleName })
      .andWhere('clientRelation.id IS NULL')
      .andWhere(
        '(profileRelation.firstName ILIKE :search OR profileRelation.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${searchTerms}%` },
      )
      .orderBy('profileRelation.firstName', 'ASC')
      .limit(5)
      .getMany();
  }
}
