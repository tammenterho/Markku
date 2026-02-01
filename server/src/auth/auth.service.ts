import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await this.passwordService.hash(password);

    return this.userService.create(username, passwordHash);
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
