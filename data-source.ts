import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './src/users/user.entity';
import { RoleEntity } from './src/roles/role.entity';
import { ClientProfileEntity } from './src/client-profiles/client-profile.entity';
import { ProjectEntity } from './src/projects/project.entity';
import { TaskEntity } from './src/tasks/task.entity';

import { UserProfileEntity } from './src/user-profiles/user-profiles.entity';

dotenv.config();
const isSslRequired =
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.POSTGRES_BASE?.includes('sslmode=require'));

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crm_db',
  ssl: isSslRequired ? { rejectUnauthorized: false } : false,
  entities: [
    UserEntity,
    RoleEntity,
    ClientProfileEntity,
    ProjectEntity,
    TaskEntity,
    UserProfileEntity,
  ],
  migrations: ['./src/migrations/*.ts'],
  synchronize: true,
};

export const AppDataSource = new DataSource(
  process.env.POSTGRES_BASE
    ? {
      ...baseConfig,
      url: process.env.POSTGRES_BASE,
    }
    : baseConfig,
);