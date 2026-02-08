import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult, DataSource } from 'typeorm';
import { Campaign } from './campaign.entity';
import { AppDataSource } from '../data-source';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    // Käytetään suoraan AppDataSource, koska dependency injection ei ole käytössä
    private readonly dataSource: DataSource = AppDataSource,
  ) {}

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  // Hakee kaikki kampanjat annetun companyId-listan (uuid, linkId) perusteella
  async findAllByCompanyIds(companyIds: string[]): Promise<Campaign[]> {
    console.log('findAllByCompanyIds called with:', companyIds);
    const allCampaigns: Campaign[] = [];
    for (const companyId of companyIds) {
      // companyId on uuid (linkId), haetaan companies-taulusta id (serial)
      const company = await this.dataSource.query(
        'SELECT id FROM companies WHERE "linkId" = $1',
        [companyId],
      );
      console.log(`Company lookup for linkId ${companyId}:`, company);
      if (!company[0]) continue;
      const schema = `tenant_${company[0].id}`;
      console.log(`Querying schema: ${schema}`);
      try {
        const rows = await this.dataSource.query(
          `SELECT * FROM "${schema}".campaigns`,
        );
        console.log(`Found ${rows.length} campaigns in ${schema}`);
        allCampaigns.push(...rows);
      } catch (e) {
        console.error(`Error querying ${schema}:`, e);
        // Skeemaa/taulua ei ole, ohita
      }
    }
    console.log(`Total campaigns found: ${allCampaigns.length}`);
    return allCampaigns;
  }

  async create(campaignData: Partial<Campaign>): Promise<any> {
    // Hae company, jonka linkId = campaignData.companyId
    const company = await this.dataSource.query(
      'SELECT id FROM companies WHERE "linkId" = $1',
      [campaignData.companyId],
    );
    console.log('Company found for campaign:', company);
    if (!company[0]) throw new Error('Company not found');
    const schema = `tenant_${company[0].id}`;
    // Luo insert-lause dynaamisesti
    const fields = Object.keys(campaignData);
    const values = Object.values(campaignData);
    const columns = fields.map((f) => `"${f}"`).join(', ');
    const params = fields.map((_, i) => `$${i + 1}`).join(', ');
    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".campaigns (${columns}) VALUES (${params}) RETURNING *`,
      values,
    );
    return result[0];
  }

  async update(
    id: string,
    campaignData: Partial<Campaign>,
  ): Promise<UpdateResult> {
    return this.campaignRepository.update(id, campaignData);
  }

  async remove(id: string): Promise<DeleteResult> {
    return this.campaignRepository.delete(id);
  }
}
