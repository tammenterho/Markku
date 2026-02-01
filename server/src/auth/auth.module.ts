import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User])],
  providers: [UsersService, PasswordService, AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
