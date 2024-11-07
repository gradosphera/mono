// modules/appstore/controllers/appstore.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppManagementService } from '../services/appstore-app.service';
import { ExtensionDomainEntity } from '../../../domain/extension/entities/extension-domain.entity';

@Controller('appstore')
export class AppStoreController<TConfig = any> {
  constructor(private readonly appManagementService: AppManagementService<TConfig>) {}

  @Post('install')
  async installApp(@Body() appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    return this.appManagementService.installApp(appData);
  }

  @Get('apps')
  async getAppList(): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.appManagementService.getAppList();
  }
}
