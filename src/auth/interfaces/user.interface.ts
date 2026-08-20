import { UserEntity } from 'src/users/user.entity';

export interface UserPayload {
  sub: number;
  email: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user: UserEntity;
}
