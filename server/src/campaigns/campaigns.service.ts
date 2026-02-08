import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult, DataSource } from 'typeorm';
import { Campaign } from './campaign.entity';
import { TENANT_PREFIX, CAMPAIGN_ALLOWED_FIELDS } from '../common/constants';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private readonly dataSource: DataSource,
  ) {}

  private async getCompanyByLinkId(
    linkId: string,
  ): Promise<{ id: number } | null> {
    const result = await this.dataSource.query(
      'SELECT id FROM companies WHERE "linkId" = $1',
      [linkId],
    );
    return result[0] || null;
  }

  private getSchemaName(companyId: number): string {
    return `${TENANT_PREFIX}${companyId}`;
  }

  private async findCampaignInSchemas(
    campaignId: string,
    companyIds: string[],
  ): Promise<{ campaign: any; schema: string } | null> {
    for (const companyId of companyIds) {
      const company = await this.getCompanyByLinkId(companyId);
      if (!company) continue;

      const schema = this.getSchemaName(company.id);
      try {
        const result = await this.dataSource.query(
          `SELECT * FROM "${schema}".campaigns WHERE id = $1`,
          [campaignId],
        );
        if (result[0]) {
          return { campaign: result[0], schema };
        }
      } catch (error) {
        // Skeemaa ei ole, jatka seuraavaan
      }
    }
    return null;
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  // Hakee kaikki kampanjat annetun companyId-listan (uuid, linkId) perusteella
  async findAllByCompanyIds(companyIds: string[]): Promise<Campaign[]> {
    this.logger.log(`Fetching campaigns for ${companyIds.length} companies`);
    const allCampaigns: Campaign[] = [];

    for (const companyId of companyIds) {
      const company = await this.getCompanyByLinkId(companyId);
      if (!company) {
        this.logger.warn(`Company not found for linkId: ${companyId}`);
        continue;
      }

      const schema = this.getSchemaName(company.id);
      try {
        const rows = await this.dataSource.query(
          `SELECT * FROM "${schema}".campaigns`,
        );
        this.logger.log(`Found ${rows.length} campaigns in ${schema}`);
        allCampaigns.push(...rows);
      } catch (error) {
        this.logger.error(`Error querying ${schema}: ${error.message}`);
      }
    }

    return allCampaigns;
  }

  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    if (!campaignData.companyId) {
      throw new Error('Company ID is required');
    }

    const company = await this.getCompanyByLinkId(campaignData.companyId);
    if (!company) {
      throw new NotFoundException(
        `Company not found for linkId: ${campaignData.companyId}`,
      );
    }

    this.logger.log(`Creating campaign in company ${company.id}`);
    const schema = this.getSchemaName(company.id);

    // Validoi ja filtteröi kentät
    const allowedFields = CAMPAIGN_ALLOWED_FIELDS as readonly string[];
    const fields = Object.keys(campaignData).filter((key) =>
      allowedFields.includes(key),
    );
    const values = fields.map((key) => campaignData[key]);

    if (fields.length === 0) {
      throw new Error('No valid fields provided');
    }

    const columns = fields.map((f) => `"${f}"`).join(', ');
    const params = fields.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const result = await this.dataSource.query(
        `INSERT INTO "${schema}".campaigns (${columns}) VALUES (${params}) RETURNING *`,
        values,
      );
      this.logger.log(`Campaign created successfully in ${schema}`);
      return result[0];
    } catch (error) {
      this.logger.error(
        `Error creating campaign in ${schema}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    campaignData: Partial<Campaign>,
    companyIds: string[],
  ): Promise<any> {
    this.logger.log(`Updating campaign ${id}`);
    const found = await this.findCampaignInSchemas(id, companyIds);

    if (!found) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    // Validoi ja filtteröi kentät
    const allowedFields = CAMPAIGN_ALLOWED_FIELDS as readonly string[];
    const fields = Object.keys(campaignData).filter((key) =>
      allowedFields.includes(key),
    );

    if (fields.length === 0) {
      throw new Error('No valid fields provided');
    }

    const setClause = fields
      .map((field, index) => `"${field}" = $${index + 2}`)
      .join(', ');
    const values = [id, ...fields.map((key) => campaignData[key])];

    try {
      const result = await this.dataSource.query(
        `UPDATE "${found.schema}".campaigns SET ${setClause}, "updatedAt" = now() WHERE id = $1 RETURNING *`,
        values,
      );
      this.logger.log(`Campaign ${id} updated in ${found.schema}`);
      return result[0];
    } catch (error) {
      this.logger.error(`Error updating campaign ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, companyIds: string[]): Promise<any> {
    this.logger.log(`Deleting campaign ${id}`);
    const found = await this.findCampaignInSchemas(id, companyIds);

    if (!found) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    try {
      const result = await this.dataSource.query(
        `DELETE FROM "${found.schema}".campaigns WHERE id = $1 RETURNING *`,
        [id],
      );
      this.logger.log(`Campaign ${id} deleted from ${found.schema}`);
      return result[0];
    } catch (error) {
      this.logger.error(`Error deleting campaign ${id}: ${error.message}`);
      throw error;
    }
  }
}
