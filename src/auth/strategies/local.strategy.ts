import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserEntity } from 'src/users/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<Omit<UserEntity, 'passwordHash'>> {
    this.logger.log(`Validating credentials for email: ${email}`);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      this.logger.warn(`Authentication failed for email: ${email}`);
      throw new UnauthorizedException('Wrong email or password');
    }
    this.logger.log(`User ${email} authenticated successfully`);
    return user;
  }
}
