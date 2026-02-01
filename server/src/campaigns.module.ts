import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
