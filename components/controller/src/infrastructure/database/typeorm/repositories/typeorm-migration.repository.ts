import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MigrationEntity } from '../entities/migration.entity';
import { IMigrationRepository } from '~/domain/system/repositories/migration-domain.repository';

@Injectable()
export class TypeOrmMigrationRepository implements IMigrationRepository {
  constructor(
    @InjectRepository(MigrationEntity)
    private migrationRepository: Repository<MigrationEntity>
  ) {}

  async getMigrations(): Promise<MigrationEntity[]> {
    return this.migrationRepository.find({
      order: { version: 'ASC' },
    });
  }

  async saveMigration(migration: MigrationEntity): Promise<MigrationEntity> {
    return this.migrationRepository.save(migration);
  }

  async getLastSuccessfulMigration(): Promise<MigrationEntity | null> {
    return this.migrationRepository.findOne({
      where: { success: true },
      order: { version: 'DESC' },
    });
  }

  async getMigrationByVersion(version: string): Promise<MigrationEntity | null> {
    return this.migrationRepository.findOne({ where: { version } });
  }

  async updateMigrationLogs(version: string, logs: string): Promise<void> {
    await this.migrationRepository.update({ version }, { logs });
  }
}
