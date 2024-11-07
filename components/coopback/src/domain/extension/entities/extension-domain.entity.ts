import type { ExtensionDomainInterface } from '../interfaces/extension-domain.interface';

// domain/appstore/entities/extension-domain.entity.ts
export class ExtensionDomainEntity<TConfig = any> implements ExtensionDomainInterface<TConfig> {
  constructor(
    public readonly name: string,
    public readonly enabled: boolean,
    public readonly config: TConfig,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}
}
