// domain/appstore/services/appstore-domain.service.ts

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { APP_REPOSITORY, ExtensionDomainRepository } from '../repositories/extension-domain.repository.interface';
import { ExtensionDomainEntity } from '../entities/extension-domain.entity';

@Injectable()
export class ExtensionDomainService<TConfig = any> {
  constructor(
    @Inject(APP_REPOSITORY) private readonly extensionDomainService: ExtensionDomainRepository<TConfig> // Используем токен для инъекции зависимости
  ) {}

  async getAppList(): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.extensionDomainService.findAll();
  }

  async getAppByName(name: string): Promise<ExtensionDomainEntity<TConfig> | null> {
    return this.extensionDomainService.findByName(name);
  }

  async installApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    if (!appData.name) {
      throw new BadRequestException('Application name is required');
    }

    const existingApp = await this.getAppByName(appData.name);

    if (existingApp) {
      throw new Error('Application is already installed.');
    }

    return this.extensionDomainService.create(appData);
  }

  getDefaultApps(): Partial<ExtensionDomainEntity>[] {
    return [
      {
        name: 'powerup',
        enabled: true,
        config: {
          dailyPackageSize: 5,
          topUpAmount: 5,
          systemSymbol: 'AXON',
          systemPrecision: 4,
          thresholds: {
            cpu: 5000,
            net: 1024,
            ram: 10240,
          },
        },
      },
      {
        name: 'qrpay',
        enabled: true,
        config: {},
      },
    ];
  }
}
