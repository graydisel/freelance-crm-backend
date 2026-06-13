import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './src/users/user.entity';
import { RoleEntity } from './src/roles/role.entity';
import { ClientProfileEntity } from './src/client-profiles/client-profile.entity';
import {ProjectEntity} from "./src/projects/project.entity";
import {TaskEntity} from "./src/tasks/task.entity";

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.POSTGRES_BASE,
    ssl: true,
    entities: [UserEntity, RoleEntity, ClientProfileEntity, ProjectEntity, TaskEntity],
    migrations: ['./src/migrations/*.ts'],
    synchronize: false,
});