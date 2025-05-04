export interface MigrationDomainInterface {
  version: string;
  name: string;
  executedAt: Date;
  success: boolean;
}

export interface IMigrationRepository {
  getMigrations(): Promise<MigrationDomainInterface[]>;
  saveMigration(migration: MigrationDomainInterface): Promise<MigrationDomainInterface>;
  getLastSuccessfulMigration(): Promise<MigrationDomainInterface | null>;
  getMigrationByVersion(version: string): Promise<MigrationDomainInterface | null>;
}

export const MIGRATION_REPOSITORY = Symbol('MIGRATION_REPOSITORY');
