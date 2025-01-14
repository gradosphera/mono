// domain/appstore/interfaces/extension-domain.interface.ts
export interface ExtensionDomainInterface<TConfig = any> {
  name: string;
  enabled: boolean;
  config: TConfig;
  created_at?: Date;
  updated_at?: Date;
}
