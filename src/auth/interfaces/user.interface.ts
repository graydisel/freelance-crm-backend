import { UserEntity } from 'src/users/user.entity';

export interface UserPayload {
  sub: number;
  email: string;
  role?: string;
}
