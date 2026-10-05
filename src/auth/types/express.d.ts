import { AuthenticatedUser } from "../interfaces/request-with-user.interface";

declare global {
    namespace Express {
        interface User extends AuthenticatedUser { }
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}