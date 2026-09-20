import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    this.logger.debug(`Attempting to validate user with email: ${email}`);
    const user = await this.usersService.findForAuth(email);

    if (!user) {
      this.logger.warn(`Validation failed: User not found for email ${email}`);
      return null;
    }

    const isPasswordMatching = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordMatching) {
      this.logger.warn(
        `Validation failed: Password mismatch for email ${email}`,
      );
      return null;
    }

    this.logger.log(`User validated successfully: ${email}`);
    delete (user as Partial<UserEntity>).passwordHash;
    return user;
  }

  async login(user: UserEntity) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
          ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
            }
          : null,
        role: user.role?.name,
      },
    };
  }
}
