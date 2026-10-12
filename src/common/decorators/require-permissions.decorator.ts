import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../roles/enums/permission.enum';
import * as dotenv from 'dotenv';

dotenv.config();

export const PERMISSIONS_KEY = process.env.PERMISSIONS_KEY || 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
