import type { LogExtensionDomainInterface } from '../interfaces/log-extension-domain.interface';

// domain/appstore/entities/log-extension-domain.entity.ts
export class LogExtensionDomainEntity<TLog = any> implements LogExtensionDomainInterface {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly extension_local_id: number,
    public readonly data: TLog,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}
}
