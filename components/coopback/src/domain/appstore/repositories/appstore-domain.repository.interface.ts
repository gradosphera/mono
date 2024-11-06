// domain/appstore/repositories/appstore-domain.repository.interface.ts

import { AppStoreDomainEntity } from '../entities/appstore-domain.entity';

export interface AppStoreDomainRepository<TConfig = any> {
  findByName(name: string): Promise<AppStoreDomainEntity<TConfig> | null>;
  create(data: Partial<AppStoreDomainEntity<TConfig>>): Promise<AppStoreDomainEntity<TConfig>>;
  findAll(): Promise<AppStoreDomainEntity<TConfig>[]>;
}

export const APP_REPOSITORY = Symbol('AppStoreDomainRepository'); // Создаем уникальный токен
