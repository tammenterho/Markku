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

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Company | null> {
    return this.companiesService.findOne(id);
  }

  @Post()
  create(@Body() company: Partial<Company>) {
    return this.companiesService.create(company);
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
