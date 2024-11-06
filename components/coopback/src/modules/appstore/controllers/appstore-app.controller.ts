// modules/appstore/controllers/appstore.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppManagementService } from '../services/appstore-app.service';
import { AppStoreDomainEntity } from '../../../domain/appstore/entities/appstore-domain.entity';

@Controller('appstore')
export class AppStoreController<TConfig = any> {
  constructor(private readonly appManagementService: AppManagementService<TConfig>) {}

  @Post('install')
  async installApp(@Body() appData: Partial<AppStoreDomainEntity<TConfig>>): Promise<AppStoreDomainEntity<TConfig>> {
    return this.appManagementService.installApp(appData);
  }

  @Get('apps')
  async getAppList(): Promise<AppStoreDomainEntity<TConfig>[]> {
    return this.appManagementService.getAppList();
  }
}
