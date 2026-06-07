import {
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Campaign } from './campaign.entity';
import { TENANT_PREFIX, CAMPAIGN_ALLOWED_FIELDS } from '../common/constants';
import {
  MetaAdsPublisherService,
  type MetaPublishResult,
} from './meta-ads-publisher.service';

export interface PublishCampaignResponse {
  campaign: Campaign;
  meta: MetaPublishResult;
}

type CompanyIdRow = { id: number };

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private readonly dataSource: DataSource,
    private readonly metaAdsPublisherService: MetaAdsPublisherService,
  ) {}

  private async getCompanyByLinkId(
    linkId: string,
  ): Promise<{ id: number } | null> {
    const result = await this.dataSource.query<CompanyIdRow[]>(
      'SELECT id FROM companies WHERE "linkId" = $1',
      [linkId],
    );
    return result[0] ?? null;
  }

  private getSchemaName(companyId: number): string {
    return `${TENANT_PREFIX}${companyId}`;
  }

  private async ensureCampaignSchemaCompatibility(
    schema: string,
  ): Promise<void> {
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns DROP COLUMN IF EXISTS "clientId"`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "imageUrls" text[] DEFAULT '{}'`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaCampaignId" varchar(255)`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaAdSetId" varchar(255)`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaCreativeId" varchar(255)`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaAdId" varchar(255)`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaPublishStatus" varchar(50)`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaPublishError" text`,
    );
    await this.dataSource.query(
      `ALTER TABLE "${schema}".campaigns ADD COLUMN IF NOT EXISTS "metaLastPublishedAt" timestamp`,
    );
  }

  private async findCampaignInSchemas(
    campaignId: string,
    companyIds: string[],
  ): Promise<{ campaign: Campaign; schema: string } | null> {
    for (const companyId of companyIds) {
      const company = await this.getCompanyByLinkId(companyId);
      if (!company) continue;

      const schema = this.getSchemaName(company.id);
      try {
        const result = await this.dataSource.query<Campaign[]>(
          `SELECT * FROM "${schema}".campaigns WHERE id = $1`,
          [campaignId],
        );
        if (result[0]) {
          return { campaign: result[0], schema };
        }
      } catch {
        // Skeemaa ei ole, jatka seuraavaan
      }
    }
    return null;
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  async findOneByCompanyIds(
    id: string,
    companyIds: string[],
  ): Promise<Campaign> {
    this.logger.log(`Fetching campaign ${id}`);
    const found = await this.findCampaignInSchemas(id, companyIds);

    if (!found) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    await this.ensureCampaignSchemaCompatibility(found.schema);
    return found.campaign;
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
        const rows = await this.dataSource.query<Campaign[]>(
          `SELECT * FROM "${schema}".campaigns`,
        );
        this.logger.log(`Found ${rows.length} campaigns in ${schema}`);
        allCampaigns.push(...rows);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error querying ${schema}: ${errorMessage}`);
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
    await this.ensureCampaignSchemaCompatibility(schema);

    // Validoi ja filtteröi kentät
    const allowedFields =
      CAMPAIGN_ALLOWED_FIELDS as readonly (keyof Campaign)[];
    const fields = (Object.keys(campaignData) as Array<keyof Campaign>).filter(
      (key) => allowedFields.includes(key),
    );
    const values: unknown[] = fields.map((key) => campaignData[key]);

    if (fields.length === 0) {
      throw new Error('No valid fields provided');
    }

    const columns = fields.map((f) => `"${f}"`).join(', ');
    const params = fields.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const result = await this.dataSource.query<Campaign[]>(
        `INSERT INTO "${schema}".campaigns (${columns}) VALUES (${params}) RETURNING *`,
        values,
      );
      this.logger.log(`Campaign created successfully in ${schema}`);
      return result[0];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error creating campaign in ${schema}: ${errorMessage}`,
      );
      throw error;
    }
  }

  async update(
    id: string,
    campaignData: Partial<Campaign>,
    companyIds: string[],
  ): Promise<Campaign> {
    this.logger.log(`Updating campaign ${id}`);
    const found = await this.findCampaignInSchemas(id, companyIds);

    if (!found) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    await this.ensureCampaignSchemaCompatibility(found.schema);

    // Validoi ja filtteröi kentät
    const allowedFields =
      CAMPAIGN_ALLOWED_FIELDS as readonly (keyof Campaign)[];
    const fields = (Object.keys(campaignData) as Array<keyof Campaign>).filter(
      (key) => allowedFields.includes(key),
    );

    if (fields.length === 0) {
      throw new Error('No valid fields provided');
    }

    const setClause = fields
      .map((field, index) => `"${field}" = $${index + 2}`)
      .join(', ');
    const values: unknown[] = [id, ...fields.map((key) => campaignData[key])];

    try {
      const result = await this.dataSource.query<Campaign[]>(
        `UPDATE "${found.schema}".campaigns SET ${setClause}, "updatedAt" = now() WHERE id = $1 RETURNING *`,
        values,
      );
      this.logger.log(`Campaign ${id} updated in ${found.schema}`);
      return result[0];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating campaign ${id}: ${errorMessage}`);
      throw error;
    }
  }

  async remove(id: string, companyIds: string[]): Promise<Campaign> {
    this.logger.log(`Deleting campaign ${id}`);
    const found = await this.findCampaignInSchemas(id, companyIds);

    if (!found) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    try {
      const result = await this.dataSource.query<Campaign[]>(
        `DELETE FROM "${found.schema}".campaigns WHERE id = $1 RETURNING *`,
        [id],
      );
      this.logger.log(`Campaign ${id} deleted from ${found.schema}`);
      return result[0];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting campaign ${id}: ${errorMessage}`);
      throw error;
    }
  }

  async publish(
    id: string,
    companyIds: string[],
  ): Promise<PublishCampaignResponse> {
    this.logger.log(`Publishing campaign ${id}`);
    const found = await this.findCampaignInSchemas(id, companyIds);

    if (!found) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }

    await this.ensureCampaignSchemaCompatibility(found.schema);

    try {
      const publishResult = await this.metaAdsPublisherService.publishCampaign(
        found.campaign,
      );

      const updatedCampaign = await this.persistPublishResult(
        found.schema,
        id,
        publishResult,
      );

      return {
        campaign: updatedCampaign,
        meta: publishResult,
      };
    } catch (error) {
      const errorMessage = this.resolveErrorMessage(error);

      await this.persistPublishFailure(found.schema, id, errorMessage);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(errorMessage);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (response && typeof response === 'object' && 'message' in response) {
        const message = (response as { message?: unknown }).message;
        if (Array.isArray(message)) {
          return message.join(', ');
        }
        if (typeof message === 'string') {
          return message;
        }
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown Meta publishing error';
  }

  private async persistPublishResult(
    schema: string,
    campaignId: string,
    publishResult: MetaPublishResult,
  ): Promise<Campaign> {
    const result = await this.dataSource.query<Campaign[]>(
      `UPDATE "${schema}".campaigns
       SET "metaCampaignId" = $2,
           "metaAdSetId" = $3,
           "metaCreativeId" = $4,
           "metaAdId" = $5,
           "metaPublishStatus" = $6,
           "metaPublishError" = NULL,
           "metaLastPublishedAt" = now(),
           "status" = true,
           "updatedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [
        campaignId,
        publishResult.metaCampaignId,
        publishResult.metaAdSetId,
        publishResult.metaCreativeId,
        publishResult.metaAdId,
        publishResult.status,
      ],
    );

    return result[0];
  }

  private async persistPublishFailure(
    schema: string,
    campaignId: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `UPDATE "${schema}".campaigns
         SET "metaPublishStatus" = $2,
             "metaPublishError" = $3,
             "updatedAt" = now()
         WHERE id = $1`,
        [campaignId, 'failed', errorMessage],
      );
    } catch (persistError) {
      const persistErrorMessage =
        persistError instanceof Error
          ? persistError.message
          : String(persistError);
      this.logger.error(
        `Failed to persist Meta publish error for campaign ${campaignId}: ${persistErrorMessage}`,
      );
    }
  }
}
