import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  private readonly refreshExpiresIn = '3d';

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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.passwordService.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await this.passwordService.hash(newPassword);
    await this.userService.updatePassword(userId, newHash);

    return { success: true };
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    };
  }

  refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      }) as { sub: string; username: string };

      const tokenPayload = {
        sub: payload.sub,
        username: payload.username,
      };

      return {
        accessToken: this.jwtService.sign(tokenPayload),
        refreshToken: this.jwtService.sign(tokenPayload, {
          secret: this.refreshSecret,
          expiresIn: this.refreshExpiresIn,
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
