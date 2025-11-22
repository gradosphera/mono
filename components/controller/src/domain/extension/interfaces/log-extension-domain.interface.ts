// domain/appstore/interfaces/extension-domain.interface.ts
import type { LogExtensionDomainEntity } from '../entities/log-extension-domain.entity';

export interface LogExtensionDomainInterface<TLog = any> {
  id: number;
  name: string;
  extension_local_id: number;
  data: TLog;
  created_at: Date;
  updated_at: Date;
}

export interface LogExtensionFilter {
  name?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface LogExtensionPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface LogExtensionPaginationResult<TLog = any> {
  items: LogExtensionDomainEntity<TLog>[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
