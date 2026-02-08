import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Logger,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './campaign.entity';
import { UsersService } from '../users/users.service';
import type { Request } from 'express';
import { USER_ID_HEADER } from '../common/constants';

@Controller('campaigns')
export class CampaignsController {
  private readonly logger = new Logger(CampaignsController.name);

  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(@Req() req: Request): Promise<Campaign[]> {
    // Käyttäjän uuid headerissa
    const userId = req.headers[USER_ID_HEADER] as string;
    if (!userId) {
      this.logger.warn('No user ID provided in request');
      return [];
    }
    const user = await this.usersService.findById(userId);
    this.logger.log(
      `User found for campaigns: ${user?.username}, companies: ${user?.companies}`,
    );
    if (!user || !user.companies) return [];
    return this.campaignsService.findAllByCompanyIds(user.companies);
  }

  @Post()
  create(@Body() campaign: Partial<Campaign>) {
    return this.campaignsService.create(campaign);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() campaign: Partial<Campaign>) {
    this.logger.log(`Updating campaign ${id}`);
    return this.campaignsService.update(id, campaign);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}
