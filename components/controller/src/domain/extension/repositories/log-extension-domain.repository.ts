// domain/extension/repositories/log-extension-domain.repository.interface.ts

import { LogExtensionDomainEntity } from '../entities/log-extension-domain.entity';

export interface LogExtensionDomainRepository<TLog = any> {
  push(name: string, data: TLog): Promise<LogExtensionDomainEntity<TLog>>;
  get(): Promise<LogExtensionDomainEntity<TLog>[]>;
}

export const LOG_EXTENSION_REPOSITORY = Symbol('LogExtensionDomainRepository'); // Создаем уникальный токен
