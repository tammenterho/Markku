import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    return this.usersService.findByUsername(username);
  }

  @Post(':username/companies')
  async addCompanyToUser(
    @Param('username') username: string,
    @Body('companyId') companyId: string,
  ): Promise<User | null> {
    return this.usersService.addCompanyToUserByUsername(username, companyId);
  }
}
