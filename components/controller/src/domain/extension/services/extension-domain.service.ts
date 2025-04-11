// domain/appstore/services/appstore-domain.service.ts

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { EXTENSION_REPOSITORY, ExtensionDomainRepository } from '../repositories/extension-domain.repository';
import { ExtensionDomainEntity } from '../entities/extension-domain.entity';

@Injectable()
export class ExtensionDomainService<TConfig = any> {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionDomainRepository: ExtensionDomainRepository<TConfig> // Используем токен для инъекции зависимости
  ) {}

  async getAppList(filter?: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>[]> {
    return this.extensionDomainRepository.find(filter);
  }

  async getAppByName(name: string): Promise<ExtensionDomainEntity<TConfig> | null> {
    return this.extensionDomainRepository.findByName(name);
  }

  async updateApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    if (!appData.name) {
      throw new BadRequestException('Application name is required');
    }

    return await this.extensionDomainRepository.update(appData);
  }

  async installApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>> {
    if (!appData.name) {
      throw new BadRequestException('Application name is required');
    }

    const existingApp = await this.getAppByName(appData.name);

    if (existingApp) {
      throw new Error('Application is already installed.');
    }

    return this.extensionDomainRepository.create(appData);
  }

  async uninstallApp(appData: Partial<ExtensionDomainEntity<TConfig>>): Promise<boolean> {
    if (!appData.name) {
      throw new BadRequestException('Application name is required');
    }

    return this.extensionDomainRepository.deleteByName(appData.name);
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
      {
        name: 'chairman',
        enabled: true,
        config: {},
      },
      {
        name: 'soviet',
        enabled: true,
        config: {},
      },
      {
        name: 'participant',
        enabled: true,
        config: {},
      },
      {
        name: 'contributor',
        enabled: true,
        config: {},
      },
    ];
  }
}
