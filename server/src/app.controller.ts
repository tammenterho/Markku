import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

export class Campaign {
  id: string;
  clientId: string;
  companyId: string;
  company: string;
  customer: string;
  name: string;
  title: string;
  copyText: string;
  targetAge: string;
  targetArea: string;
  budget: number;
  start: Date;
  end: Date;
  status: string;
  type: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('campaigns')
  getHello(): Campaign {
    console.log('test');
    return {
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
    };
  }
}
