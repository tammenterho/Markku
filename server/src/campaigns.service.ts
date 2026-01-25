import { Injectable } from '@nestjs/common';
import { Campaign } from './campaign.entity';
import { AppDataSource } from './data-source';

@Injectable()
export class CampaignsService {
  async findAll(): Promise<Campaign[]> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return AppDataSource.manager.find(Campaign);
  }

  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('CREATING1');
    return AppDataSource.getRepository(Campaign).save(campaignData);
  }
}
