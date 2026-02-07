import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './companies.entity';
import { UsersService } from '../users/users.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Company | null> {
    return this.companiesService.findOne(id);
  }
  @Post()
  async create(
    @Body() company: Partial<Company> & { creatorUsername?: string },
  ) {
    const created = await this.companiesService.create(company);
    // if creatorUsername provided, append company id to user's companies
    if (company.creatorUsername) {
      try {
        await this.usersService.addCompanyToUserByUsername(
          company.creatorUsername,
          created.id,
        );
      } catch (err) {
        // log and continue
        console.error('Error adding company to user:', err);
      }
    }
    return created;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() company: Partial<Company>) {
    return this.companiesService.update(id, company);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
