import { AuthenticatedUser } from '../interfaces/request-with-user.interface';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthenticatedUser {}
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
