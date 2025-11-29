import { Injectable } from '@nestjs/common';
import { Campaign } from './campaign.entity';

@Injectable()
export class CampaignsService {
  private readonly campaigns: Campaign[] = [];

  constructor() {
    this.addMockData();
  }

  private addMockData(): void {
    console.log('Adding mock data...');
    const mockCampaign: Campaign = {
      id: '659e7d23473b8d69cb77c2fb',
      clientId: '659e7d23473b8d69cb77c2fb',
      companyId: '659e7d23473b8d69cb77c2fb',
      company: 'M&M Kuntotalo',
      customer: 'Ville Vallaton',
      name: 'Joulukamppis',
      title: 'Sama kuin ennen joulua',
      copyText: 'Tervetuloa, isot alet!!!',
      targetAge: 'Age undefined, undefined',
      targetArea: 'Area undefined, undefined',
      budget: 300,
      start: new Date('2024-01-11T00:00:00.000Z'),
      end: new Date('2024-01-26T00:00:00.000Z'),
      status: 'Y',
      type: 'AD',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.push(mockCampaign);
  }

  findAll(): Campaign[] {
    console.log('Getting mock data...');
    return this.campaigns;
  }
}
