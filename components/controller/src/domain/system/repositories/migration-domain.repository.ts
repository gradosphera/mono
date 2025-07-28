export interface MigrationDomainInterface {
  version: string;
  name: string;
  executedAt: Date;
  success: boolean;
  logs?: string;
}

export interface IMigrationRepository {
  getMigrations(): Promise<MigrationDomainInterface[]>;
  saveMigration(migration: MigrationDomainInterface): Promise<MigrationDomainInterface>;
  getLastSuccessfulMigration(): Promise<MigrationDomainInterface | null>;
  getMigrationByVersion(version: string): Promise<MigrationDomainInterface | null>;
  updateMigrationLogs(version: string, logs: string): Promise<void>;
}

export const MIGRATION_REPOSITORY = Symbol('MIGRATION_REPOSITORY');
