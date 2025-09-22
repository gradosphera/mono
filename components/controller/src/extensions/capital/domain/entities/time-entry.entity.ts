import { BaseDomainEntity } from './base.entity';
import type { ITimeEntryDatabaseData } from '../interfaces/time-entry-database.interface';

/**
 * Доменная сущность записи времени
 */
export class TimeEntryDomainEntity extends BaseDomainEntity<ITimeEntryDatabaseData> {
  public contributor_hash!: string;
  public issue_hash!: string;
  public project_hash!: string;
  public coopname!: string;
  public date!: string; // YYYY-MM-DD
  public hours!: number;
  public commit_hash?: string;
  public is_committed!: boolean;

  constructor(databaseData: ITimeEntryDatabaseData) {
    super(databaseData, 'active'); // Статус для записей времени

    // Присваиваем специфичные поля записи времени
    this.contributor_hash = databaseData.contributor_hash;
    this.issue_hash = databaseData.issue_hash;
    this.project_hash = databaseData.project_hash;
    this.coopname = databaseData.coopname;
    this.date = databaseData.date;
    this.hours = databaseData.hours;
    this.commit_hash = databaseData.commit_hash;
    this.is_committed = databaseData.is_committed;
  }
}
