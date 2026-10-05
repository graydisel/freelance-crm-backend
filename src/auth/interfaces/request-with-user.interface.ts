import { Permission } from 'src/roles/enums/permission.enum';
import { UserEntity } from '../../users/user.entity';

export interface RequestWithUser extends Request {
  user: UserEntity;
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
