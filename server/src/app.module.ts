import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CampaignsModule } from './campaigns.module';

@Module({
  imports: [CampaignsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
