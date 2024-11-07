// domain/appstore/entities/appstore-domain.entity.ts
export class ExtensionDomainEntity<TConfig = any> {
  constructor(
    public readonly name: string,
    public readonly enabled: boolean,
    public readonly config: TConfig,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
