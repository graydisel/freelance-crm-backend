import { SetMetadata } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

export const Roles = (...roles: string[]) => SetMetadata(process.env.ROLES_KEY, roles);