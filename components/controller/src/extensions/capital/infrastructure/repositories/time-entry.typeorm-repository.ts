import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TimeEntryEntity } from '../entities/time-entry.entity';
import { TimeEntryRepository } from '../../domain/repositories/time-entry.repository';
import { TimeEntryDomainEntity } from '../../domain/entities/time-entry.entity';
import type { ITimeEntryDatabaseData } from '../../domain/interfaces/time-entry-database.interface';
import { CAPITAL_DATABASE_CONNECTION } from '../database/capital-database.module';

/**
 * TypeORM реализация репозитория записей времени
 */
@Injectable()
export class TimeEntryTypeormRepository implements TimeEntryRepository {
  constructor(
    @InjectRepository(TimeEntryEntity, CAPITAL_DATABASE_CONNECTION)
    private readonly repository: Repository<TimeEntryEntity>
  ) {}

  async create(timeEntry: TimeEntryDomainEntity): Promise<TimeEntryDomainEntity> {
    const entity = this.toEntity(timeEntry);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findByContributorAndDate(contributorHash: string, date: string): Promise<TimeEntryDomainEntity[]> {
    const entities = await this.repository.find({
      where: { contributor_hash: contributorHash, date },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findUncommittedByContributor(contributorHash: string): Promise<TimeEntryDomainEntity[]> {
    const entities = await this.repository.find({
      where: { contributor_hash: contributorHash, is_committed: false },
      order: { date: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findUncommittedByProjectAndContributor(
    projectHash: string,
    contributorHash: string
  ): Promise<TimeEntryDomainEntity[]> {
    const entities = await this.repository.find({
      where: {
        project_hash: projectHash,
        contributor_hash: contributorHash,
        is_committed: false,
      },
      order: { date: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async update(timeEntry: TimeEntryDomainEntity): Promise<TimeEntryDomainEntity> {
    const entity = this.toEntity(timeEntry);
    await this.repository.update(entity._id, entity);
    const updatedEntity = await this.repository.findOne({ where: { _id: entity._id } });
    if (!updatedEntity) throw new Error('Time entry not found after update');
    return this.toDomain(updatedEntity);
  }

  async updateMany(timeEntries: TimeEntryDomainEntity[]): Promise<void> {
    const entities = timeEntries.map((entry) => this.toEntity(entry));
    await this.repository.save(entities);
  }

  async getTotalUncommittedHours(contributorHash: string, projectHash: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('te')
      .select('SUM(te.hours)', 'total')
      .where('te.contributor_hash = :contributorHash', { contributorHash })
      .andWhere('te.project_hash = :projectHash', { projectHash })
      .andWhere('te.is_committed = false')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async getContributorProjectStats(
    contributorHash: string,
    projectHash: string
  ): Promise<{
    total_committed_hours: number;
    total_uncommitted_hours: number;
    available_hours: number;
  }> {
    // Получаем суммарное закоммиченное время
    const committedResult = await this.repository
      .createQueryBuilder('te')
      .select('SUM(te.hours)', 'total')
      .where('te.contributor_hash = :contributorHash', { contributorHash })
      .andWhere('te.project_hash = :projectHash', { projectHash })
      .andWhere('te.is_committed = true')
      .getRawOne();

    // Получаем суммарное незакоммиченное время
    const uncommittedResult = await this.repository
      .createQueryBuilder('te')
      .select('SUM(te.hours)', 'total')
      .where('te.contributor_hash = :contributorHash', { contributorHash })
      .andWhere('te.project_hash = :projectHash', { projectHash })
      .andWhere('te.is_committed = false')
      .getRawOne();

    const total_committed_hours = parseFloat(committedResult?.total || '0');
    const total_uncommitted_hours = parseFloat(uncommittedResult?.total || '0');

    // Доступное время = незакоммиченное время (ограничено 8 часами в день)
    // Для простоты считаем общее незакоммиченное время, но в будущем можно добавить логику с лимитом
    const available_hours = Math.min(total_uncommitted_hours, 8); // Пока что просто ограничиваем 8 часами

    return {
      total_committed_hours,
      total_uncommitted_hours,
      available_hours,
    };
  }

  async commitTimeEntries(entries: TimeEntryDomainEntity[], commitHash: string): Promise<void> {
    const ids = entries.map((entry) => entry._id);
    await this.repository.update({ _id: In(ids) }, { commit_hash: commitHash, is_committed: true, _updated_at: new Date() });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toEntity(domain: TimeEntryDomainEntity): TimeEntryEntity {
    const entity = new TimeEntryEntity();
    Object.assign(entity, domain);
    return entity;
  }

  private toDomain(entity: TimeEntryEntity): TimeEntryDomainEntity {
    const databaseData: ITimeEntryDatabaseData = {
      _id: entity._id,
      block_num: entity.block_num,
      present: entity.present,
      status: entity.status,
      _created_at: entity._created_at,
      _updated_at: entity._updated_at,
      contributor_hash: entity.contributor_hash,
      issue_hash: entity.issue_hash,
      project_hash: entity.project_hash,
      coopname: entity.coopname,
      date: entity.date,
      hours: entity.hours,
      commit_hash: entity.commit_hash,
      is_committed: entity.is_committed,
    };
    return new TimeEntryDomainEntity(databaseData);
  }
}
