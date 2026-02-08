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

  @Get(':linkId')
  async findOne(@Param('linkId') linkId: string): Promise<Company | null> {
    return this.companiesService.findOne(linkId);
  }

  @Post()
  async create(@Body() company: Partial<Company> & { creatorId?: string }) {
    const created = await this.companiesService.create(company);
    if (company.creatorId) {
      try {
        await this.usersService.addCompanyToUserById(
          company.creatorId,
          created.linkId,
        );
      } catch (err) {
        console.error('Error adding company to user:', err);
      }
    }
    return created;
  }

  @Patch(':linkId')
  update(@Param('linkId') linkId: string, @Body() company: Partial<Company>) {
    return this.companiesService.update(linkId, company);
  }

  @Delete(':linkId')
  delete(@Param('linkId') linkId: string) {
    return this.companiesService.remove(linkId);
  }
}
