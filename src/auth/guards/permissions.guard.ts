import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from "@nestjs/core";
import { Permission } from "src/roles/enums/permission.enum";
import { ConfigService } from "@nestjs/config";
import { AuthenticatedUser } from '../interfaces/request-with-user.interface';


@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
            this.configService.get<string>('PERMISSIONS_KEY'),
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;

        if (!user || !user.permissions) {
            throw new ForbiddenException('Access denied: no permissions found in token');
        }

        const hasAll = requiredPermissions.every((perm) =>
            user.permissions.includes(perm),
        );

        if (!hasAll) {
            throw new ForbiddenException(
                `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
            );
        }

        return true;
    }
}