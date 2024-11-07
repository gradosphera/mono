// domain/appstore/interfaces/extension-domain.interface.ts
export interface LogExtensionDomainInterface<TLog = any> {
  id: number;
  name: string;
  data: TLog;
  created_at: Date;
  updated_at: Date;
}
