import { Body, Controller, Get, Post } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './campaign.entity';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findAll(): Promise<Campaign[]> {
    return this.campaignsService.findAll();
  }

  @Post()
  create(@Body() campaign: Partial<Campaign>) {
    console.log('CREATING');

    return this.campaignsService.create(campaign);
  }
}
