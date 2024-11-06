// domain/appstore/services/appstore-domain.service.ts

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { APP_REPOSITORY, AppStoreDomainRepository } from '../repositories/appstore-domain.repository.interface';
import { AppStoreDomainEntity } from '../entities/appstore-domain.entity';

@Injectable()
export class AppStoreDomainService<TConfig = any> {
  constructor(
    @Inject(APP_REPOSITORY) private readonly appStoreDomainRepository: AppStoreDomainRepository<TConfig> // Используем токен для инъекции зависимости
  ) {}

  async getAppList(): Promise<AppStoreDomainEntity<TConfig>[]> {
    return this.appStoreDomainRepository.findAll();
  }

  async getAppByName(name: string): Promise<AppStoreDomainEntity<TConfig> | null> {
    return this.appStoreDomainRepository.findByName(name);
  }

  async installApp(appData: Partial<AppStoreDomainEntity<TConfig>>): Promise<AppStoreDomainEntity<TConfig>> {
    if (!appData.name) {
      throw new BadRequestException('Application name is required');
    }

    const existingApp = await this.getAppByName(appData.name);

    if (existingApp) {
      throw new Error('Application is already installed.');
    }

    return this.appStoreDomainRepository.create(appData);
  }

  getDefaultApps(): Partial<AppStoreDomainEntity>[] {
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
