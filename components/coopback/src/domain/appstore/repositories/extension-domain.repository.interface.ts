// domain/appstore/repositories/appstore-domain.repository.interface.ts

import { ExtensionDomainEntity } from '../entities/extension-domain.entity';

export interface ExtensionDomainRepository<TConfig = any> {
  findByName(name: string): Promise<ExtensionDomainEntity<TConfig> | null>;
  create(data: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>>;
  findAll(): Promise<ExtensionDomainEntity<TConfig>[]>;
  update(name: string, data: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>>;
}

export const APP_REPOSITORY = Symbol('ExtensionDomainRepository'); // Создаем уникальный токен
