// domain/extension/repositories/log-extension-domain.repository.interface.ts

import { LogExtensionDomainEntity } from '../entities/log-extension-domain.entity';
import type {
  LogExtensionFilter,
  LogExtensionPaginationOptions,
  LogExtensionPaginationResult,
} from '../interfaces/log-extension-domain.interface';

export interface LogExtensionDomainRepository<TLog = any> {
  push(name: string, data: TLog): Promise<LogExtensionDomainEntity<TLog>>;
  get(): Promise<LogExtensionDomainEntity<TLog>[]>;
  getWithFilter(
    filter?: LogExtensionFilter,
    options?: LogExtensionPaginationOptions
  ): Promise<LogExtensionPaginationResult<TLog>>;
}

export const LOG_EXTENSION_REPOSITORY = Symbol('LogExtensionDomainRepository'); // Создаем уникальный токен
