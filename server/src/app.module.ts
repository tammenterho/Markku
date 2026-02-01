import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CampaignsModule } from './campaigns.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CampaignsModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
