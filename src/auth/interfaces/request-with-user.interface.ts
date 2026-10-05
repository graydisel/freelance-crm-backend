import { UserEntity } from '../../users/user.entity';
import { Permission } from 'src/roles/enums/permission.enum';
import { Request } from 'express';

export interface RequestWithUserEntity extends Omit<Request, 'user'> {
  user: UserEntity;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: Permission[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  permissions: Permission[];
}
