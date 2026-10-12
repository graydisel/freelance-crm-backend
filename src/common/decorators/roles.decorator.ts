import { SetMetadata } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

export const ROLES_KEY = process.env.ROLES_KEY || 'superRolesKey';
export const Roles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
