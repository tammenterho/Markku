import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, UpdateResult, DataSource } from 'typeorm';
import { Company } from './companies.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
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
    const company = await this.companyRepository.save(data);

    // Luo skeema ja campaigns-taulu yritykselle
    const schemaName = `tenant_${company.id}`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Luo skeema jos ei ole olemassa
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      // Luo campaigns-taulu skeemaan
      await queryRunner.query(`CREATE TABLE IF NOT EXISTS "${schemaName}".campaigns (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "clientId" varchar(255) NOT NULL,
        "type" varchar(50),
        "companyId" varchar(255) NOT NULL,
        "company" varchar(255) NOT NULL,
        "payer" varchar(255),
        "name" varchar(255) NOT NULL,
        "customer" varchar(255) NOT NULL,
        "budget" numeric NOT NULL DEFAULT 0,
        "budgetPeriod" varchar(255),
        "mediaInfo" varchar(255),
        "start" timestamp,
        "end" timestamp,
        "targetArea" varchar(100),
        "targetAge" varchar(50),
        "targetGender" varchar(50),
        "title" varchar(255),
        "copyText" text,
        "url" varchar(255),
        "cta" varchar(255),
        "createdBy" varchar(255) NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )`);
    } finally {
      await queryRunner.release();
    }
    return company;
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
