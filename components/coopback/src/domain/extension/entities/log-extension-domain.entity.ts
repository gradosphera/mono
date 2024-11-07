// domain/appstore/entities/log-extension-domain.entity.ts
export class LogExtensionDomainEntity<TLog = any> {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly data: TLog,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
