import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.findForAuth(email);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      delete (user as Partial<UserEntity>).passwordHash;
      return user;
    }

    return null;
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
