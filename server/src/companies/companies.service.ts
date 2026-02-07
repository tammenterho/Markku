import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, UpdateResult } from 'typeorm';
import { Company } from './companies.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findOne(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { id } });
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    return this.companyRepository.save(companyData);
  }

  async update(
    id: string,
    companyData: Partial<Company>,
  ): Promise<UpdateResult> {
    return this.companyRepository.update(id, companyData);
  }

  async remove(id: string): Promise<DeleteResult> {
    return this.companyRepository.delete(id);
  }
}
