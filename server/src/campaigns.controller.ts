import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
    return this.campaignsService.create(campaign);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() campaign: Partial<Campaign>) {
    console.log('UPDATING');
    return this.campaignsService.update(id, campaign);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}
