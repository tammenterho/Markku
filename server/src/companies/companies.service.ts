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

  async findOne(linkId: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { linkId } });
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    // Remove linkId if present, so DB generates it
    const { linkId, ...data } = companyData;
    return this.companyRepository.save(data);
  }

  async update(
    linkId: string,
    companyData: Partial<Company>,
  ): Promise<UpdateResult> {
    return this.companyRepository.update({ linkId }, companyData);
  }

  async remove(linkId: string): Promise<DeleteResult> {
    return this.companyRepository.delete({ linkId });
  }
}
