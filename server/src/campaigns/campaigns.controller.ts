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
  async update(
    @Param('id') id: string,
    @Body() campaign: Partial<Campaign>,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating campaign ${id}`);
    this.logger.log(`Headers: ${JSON.stringify(req.headers)}`);
    const userId = req.headers[USER_ID_HEADER] as string;
    this.logger.log(`User ID from header: ${userId}`);

    if (!userId) {
      this.logger.error('User ID not found in headers');
      throw new Error('User ID required');
    }
    const user = await this.usersService.findById(userId);
    if (!user || !user.companies) {
      throw new Error('User or companies not found');
    }
    return this.campaignsService.update(id, campaign, user.companies);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Deleting campaign ${id}`);
    const userId = req.headers[USER_ID_HEADER] as string;
    if (!userId) {
      throw new Error('User ID required');
    }
    const user = await this.usersService.findById(userId);
    if (!user || !user.companies) {
      throw new Error('User or companies not found');
    }
    return this.campaignsService.remove(id, user.companies);
  }
}
