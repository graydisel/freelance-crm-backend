import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/roles/enums/permission.enum';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticatedUser,
  RequestWithUser,
} from '../interfaces/request-with-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permissionsKey =
      this.configService.get<string>('PERMISSIONS_KEY') || 'permissions';
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      permissionsKey,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: AuthenticatedUser = request.user;

    this.logger.debug(
      `Checking permissions for user ${user?.email} (${user?.role}): required [${requiredPermissions.join(', ')}]`,
    );

    if (!user || !user.permissions) {
      this.logger.warn(
        `Access denied: no permissions found for user ${user?.email}`,
      );
      throw new ForbiddenException(
        'Access denied: no permissions found in token',
      );
    }

    const hasAll = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasAll) {
      this.logger.warn(
        `User ${user.email} missing required permissions: [${requiredPermissions.join(', ')}]. User has: [${user.permissions.join(', ')}]`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
