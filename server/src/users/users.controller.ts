import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get(':username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    return this.usersService.findByUsername(username);
  }

  @Post(':id/companies')
  async addCompanyToUserById(
    @Param('id') id: string,
    @Body('companyId') companyId: string,
  ): Promise<User | null> {
    return this.usersService.addCompanyToUserById(id, companyId);
  }

  @Get(':id/companies')
  async getUserCompanies(@Param('id') id: string) {
    return this.usersService.findCompaniesForUserById(id);
  }
}
