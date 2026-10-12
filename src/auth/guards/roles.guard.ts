import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesKey = process.env.ROLES_KEY || 'superRolesKey';
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(rolesKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string; email?: string } }>();
    const user = request.user;

    this.logger.debug(
      `Checking roles for user ${user?.email} (${user?.role}): required [${requiredRoles.join(', ')}]`,
    );

    const hasRole = user?.role ? requiredRoles.includes(user.role) : false;

    if (!hasRole) {
      this.logger.warn(
        `User ${user?.email} with role '${user?.role}' does not match required roles [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        "You don't have permission to use this action",
      );
    }

    return true;
  }
}
