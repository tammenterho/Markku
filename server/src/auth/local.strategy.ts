import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
  ) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const isValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
