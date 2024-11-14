// domain/appstore/repositories/appstore-domain.repository.interface.ts

import { ExtensionDomainEntity } from '../entities/extension-domain.entity';

export interface ExtensionDomainRepository<TConfig = any> {
  findByName(name: string): Promise<ExtensionDomainEntity<TConfig> | null>;
  deleteByName(name: string): Promise<boolean>;
  create(data: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>>;
  find(filter?: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>[]>;
  update(data: Partial<ExtensionDomainEntity<TConfig>>): Promise<ExtensionDomainEntity<TConfig>>;
}

export const EXTENSION_REPOSITORY = Symbol('ExtensionDomainRepository'); // Создаем уникальный токен
