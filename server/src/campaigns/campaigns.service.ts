import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Campaign } from './campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    return this.campaignRepository.save(campaignData);
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
