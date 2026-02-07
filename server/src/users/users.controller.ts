import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CompaniesService } from '../companies/companies.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
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
    console.log(`Getting companies for user ID: ${id}`);
    const user = await this.usersService.findById(id);
    if (!user || !user.companies) return [];
    return Promise.all(
      user.companies.map((uuid) => this.companiesService.findOne(uuid)),
    );
  }
}
