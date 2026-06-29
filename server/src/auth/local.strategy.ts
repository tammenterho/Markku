import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { User } from '../users/users.entity';

type SigninBody = {
  username?: string;
  password?: string;
  usernameHash?: string;
  passwordHash?: string;
};

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
  ) {
    super({ passReqToCallback: true });
  }

  async validate(req: Request, username: string, password: string) {
    const body = req.body as SigninBody;
    const usernameCredential = body.usernameHash ?? username;
    const passwordCredential = body.passwordHash ?? password;

    if (!usernameCredential || !passwordCredential) {
      throw new UnauthorizedException();
    }

    let user: User | null = null;

    if (this.passwordService.isClientHashedCredential(usernameCredential)) {
      const activeUsers = await this.usersService.findActiveUsers();
      user =
        activeUsers.find((candidate) =>
          this.passwordService.matchesUsernameCredential(
            candidate.username,
            usernameCredential,
          ),
        ) ?? null;
    } else {
      user = await this.usersService.findByUsername(usernameCredential);
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const passwordResult = await this.passwordService.compareCredentialDetailed(
      passwordCredential,
      user.passwordHash,
    );

    if (!passwordResult.isValid) {
      throw new UnauthorizedException();
    }

    if (passwordResult.usedLegacy) {
      const upgradedHash = await this.passwordService.hash(passwordCredential);
      await this.usersService.updatePassword(user.id, upgradedHash);
      await this.usersService.markHashUpdated(user.id);
    }

    return user;
  }
}
