import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategies';
import { resolveJwtSecret } from './jwt-secret';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: resolveJwtSecret(),
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    PasswordService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
